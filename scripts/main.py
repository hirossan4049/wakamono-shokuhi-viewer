import asyncio
import json
import os
from typing import Any, Dict, Optional

import aiofiles
from openai import AsyncOpenAI


class ProductProcessor:
    def __init__(self, max_concurrent: int = 3):
        """
        max_concurrent: 同時実行数（APIレート制限を考慮して3-5程度が推奨）
        """
        self.client = AsyncOpenAI(
            api_key="sk-xxxx",
        )
        self.max_concurrent = max_concurrent
        self.enriched_file = "products_enriched.json"

    async def load_or_create_enriched_data(self, original_file: str) -> Dict[str, Any]:
        """
        products_enriched.jsonが存在すれば読み込み、なければ元ファイルから作成
        """
        if os.path.exists(self.enriched_file):
            print(f"既存の{self.enriched_file}を読み込み中...")
            async with aiofiles.open(self.enriched_file, "r") as f:
                content = await f.read()
                return json.loads(content)
        else:
            print(f"{self.enriched_file}が存在しないため、{original_file}から作成...")
            with open(original_file, "r", encoding="utf-8") as f:
                return json.load(f)

    async def save_enriched_data(self, data: Dict[str, Any]):
        """拡張データを保存（非同期）"""
        async with aiofiles.open(self.enriched_file, "w") as f:
            await f.write(json.dumps(data, ensure_ascii=False, indent=2))

    def is_product_processed(self, product: Dict[str, Any]) -> bool:
        """
        商品が処理済みかどうかを判定
        totalsとitemsフィールドが存在し、かつitemsが空でなければ処理済みとする
        """
        return (
            "totals" in product
            and "items" in product
            and isinstance(product.get("items"), list)
            and "processing_error" not in product
        )

    async def process_single_product(
        self, product: Dict[str, Any], index: int
    ) -> Optional[Dict[str, Any]]:
        """単一商品を処理してAPI結果を返す"""
        try:
            print(f"[{index}] 処理開始: {product['name']}")

            # OpenAI APIを呼び出す
            response = await self.client.responses.create(
                prompt={"id": "pmpt_68caf2ba8728819597a65ebe89d078600c09cee03badf4e5"},
                input=product["detail"],
            )

            # 結果をパース
            result = json.loads(response.output_text)

            print(
                f"[{index}] 完了: {product['name']} - 合計: {result.get('total', 0)}円"
            )

            return {"totals": result.get("total", 0), "items": result.get("items", [])}

        except Exception as e:
            print(f"[{index}] エラー: {product['name']} - {str(e)}")
            # エラーの場合は空の結果を返す（エラーであることを記録）
            return {"totals": 0, "items": [], "error": str(e)}

    async def process_and_update_product(
        self, data: Dict[str, Any], index: int, semaphore: asyncio.Semaphore
    ):
        """商品を処理して、結果を即座にファイルに保存"""
        async with semaphore:
            product = data["products"][index]

            # 既に処理済みの場合はスキップ
            if self.is_product_processed(product):
                print(f"[{index}] スキップ（処理済み）: {product['name']}")
                return

            # 処理を実行
            result = await self.process_single_product(product, index)

            if result:
                # 結果をproductに追加
                product["totals"] = result["totals"]
                product["items"] = result["items"]
                if "error" in result:
                    product["processing_error"] = result["error"]

                # ファイルに保存（毎回上書き保存）
                await self.save_enriched_data(data)
                print(f"[{index}] 保存完了: {product['name']}")

    async def run(
        self,
        json_file: str = "products.json",
        start_index: int = None,
        end_index: int = None,
    ):
        """メイン処理"""
        # products_enriched.jsonが存在すれば読み込み、なければ元ファイルから作成
        data = await self.load_or_create_enriched_data(json_file)

        products = data["products"]
        total_count = len(products)

        # 処理範囲を決定
        start_idx = start_index if start_index is not None else 0
        end_idx = end_index if end_index is not None else total_count

        # 処理対象のインデックスリストを作成（未処理のもののみ）
        indices_to_process = []
        for i in range(start_idx, min(end_idx, total_count)):
            if not self.is_product_processed(products[i]):
                indices_to_process.append(i)

        if not indices_to_process:
            print("すべての商品が処理済みです。")

            # 統計情報を表示
            processed_count = sum(1 for p in products if self.is_product_processed(p))
            print(f"\n総商品数: {total_count}")
            print(f"処理済み: {processed_count}")
            return

        print(f"総商品数: {total_count}")
        print(f"処理対象: {len(indices_to_process)}件")
        print(f"同時実行数: {self.max_concurrent}")
        print("-" * 50)

        # セマフォで同時実行数を制限
        semaphore = asyncio.Semaphore(self.max_concurrent)

        # すべてのタスクを作成
        tasks = [
            self.process_and_update_product(data, idx, semaphore)
            for idx in indices_to_process
        ]

        # すべてのタスクを実行
        await asyncio.gather(*tasks, return_exceptions=True)

        print("\n" + "=" * 50)
        print("処理完了！")

        # 最終統計を表示
        processed_count = sum(1 for p in products if self.is_product_processed(p))
        success_count = sum(
            1
            for p in products
            if self.is_product_processed(p) and "processing_error" not in p
        )
        error_count = sum(
            1
            for p in products
            if self.is_product_processed(p) and "processing_error" in p
        )

        print(f"総商品数: {total_count}")
        print(f"処理済み: {processed_count}")
        print(f"成功: {success_count}")
        print(f"エラー: {error_count}")
        print(f"未処理: {total_count - processed_count}")

        # サンプル表示
        if products and self.is_product_processed(products[0]):
            print("\n" + "-" * 50)
            print("データサンプル（最初の処理済み商品）:")
            first_product = products[0]
            print(f"商品名: {first_product['name']}")
            print(f"合計額: {first_product.get('totals', 0)}円")
            if first_product.get("items"):
                print("内訳:")
                for item in first_product["items"][:3]:
                    print(f"  - {item['name']}: {item['price']}円 × {item['amount']}個")


async def main():
    # プロセッサーを初期化（同時実行数を3に設定）
    processor = ProductProcessor(max_concurrent=10)

    # 実行
    await processor.run()

    # 特定の範囲を処理したい場合:
    # await processor.run(start_index=10, end_index=20)

    # 最初からやり直したい場合は、products_enriched.jsonを削除
    # import os
    # if os.path.exists("products_enriched.json"):
    #     os.remove("products_enriched.json")


def reset_progress():
    """進捗をリセットする関数"""
    if os.path.exists("products_enriched.json"):
        os.remove("products_enriched.json")
        print("products_enriched.jsonを削除しました。")


if __name__ == "__main__":
    # 非同期処理を実行
    asyncio.run(main())
