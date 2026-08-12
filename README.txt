# Calculator PWA - 起動処理軽量化版

置き換えるファイル:
- index.html
- service-worker.js

既存の icon-180.png / icon-192.png / icon-512.png / manifest.json はそのまま使用します。

主な変更:
- 起動時の履歴復元を1回のDOM更新に統一
- 起動時のsetTimeoutによる履歴読み込みを廃止
- 履歴項目のtext/contentを生成時に保持し、毎回querySelectorしない
- 合計計算は画面DOMを検索せず、現在の履歴配列から計算
- Service Worker登録はload後
- キャッシュ優先方式を維持
- GUI、横向き55%/45%、履歴操作、アイコン設定は維持
