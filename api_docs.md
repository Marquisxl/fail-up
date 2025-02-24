# FailUp API 仕様書 v1.0.0

## 概要

FailUpのAPIは、失敗の記録を管理するためのRESTful APIです。このAPIを使用することで、失敗の記録、振り返りの追加、記録の削除などの操作を行うことができます。

## 基本情報

- ベースURL: `http://localhost:8080/api`
- データフォーマット: JSON
- 文字エンコーディング: UTF-8

## 認証

現在、認証は実装されていません。将来のバージョンでBearer認証を実装予定です。

## 共通レスポンスフォーマット

### 成功時

```json
{
  "id": 1,
  "content": "失敗の内容",
  "category": "能力不足",
  ...
}
```

### エラー時

```json
{
  "error": "エラーメッセージ",
  "status": 400
}
```

## エンドポイント

### 1. 失敗の一覧取得

失敗の記録一覧を取得します。結果は作成日時の降順でソートされます。

#### リクエスト

```
GET /failures
```

#### レスポンス

- ステータスコード: 200 OK

```json
[
  {
    "id": 1,
    "content": "プレゼンの準備が不十分だった",
    "category": "努力不足",
    "points": 30,
    "created_at": "2024-02-24T12:00:00",
    "reflection": "次回は1週間前から準備を始める",
    "internal_factors": "準備不足,集中力",
    "external_factors": "時間制約",
    "internal_factors_detail": "計画性が足りなかった",
    "external_factors_detail": "突発的な業務が入った",
    "similar_cases": "先月のプレゼンでも同じような失敗をした",
    "next_challenge": "来月のプレゼンは2週間前から準備する",
    "challenge_type": "スキル向上,新しい方法",
    "challenge_deadline": "2024-03-24T12:00:00",
    "related_to": null,
    "relation_type": null,
    "related_content": null
  }
]
```

### 2. 新規失敗の記録

新しい失敗を記録します。

#### リクエスト

```
POST /failures
Content-Type: application/json
```

#### リクエストボディ

```json
{
  "content": "プレゼンの準備が不十分だった",
  "category": "努力不足",
  "internal_factors": "準備不足,集中力",
  "internal_factors_detail": "計画性が足りなかった",
  "external_factors": "時間制約",
  "external_factors_detail": "突発的な業務が入った",
  "similar_cases": "先月のプレゼンでも同じような失敗をした",
  "next_challenge": "来月のプレゼンは2週間前から準備する",
  "challenge_type": "スキル向上,新しい方法",
  "challenge_deadline": "2024-03-24T12:00:00"
}
```

#### 必須フィールド

- `content`: 失敗の内容（文字列）
- `category`: カテゴリ（文字列、以下のいずれか）
  - `能力不足`
  - `努力不足`
  - `環境`
  - `運`

#### オプションフィールド

- `internal_factors`: 内的要因（カンマ区切りの文字列）
- `internal_factors_detail`: 内的要因の詳細（文字列）
- `external_factors`: 外的要因（カンマ区切りの文字列）
- `external_factors_detail`: 外的要因の詳細（文字列）
- `similar_cases`: 類似事例（文字列）
- `next_challenge`: 次のチャレンジ（文字列）
- `challenge_type`: チャレンジの種類（カンマ区切りの文字列）
- `challenge_deadline`: チャレンジの期限（ISO 8601形式の日時）
- `related_to`: 関連する失敗のID（数値）
- `relation_type`: 関連の種類（文字列）

#### レスポンス

- ステータスコード: 201 Created

```json
{
  "id": 1,
  "content": "プレゼンの準備が不十分だった",
  "category": "努力不足",
  "points": 10,
  "created_at": "2024-02-24T12:00:00",
  ...
}
```

### 3. 振り返りの追加

既存の失敗記録に振り返りを追加します。振り返りを追加すると、ポイントが20点加算されます。

#### リクエスト

```
POST /failures/{id}/reflection
Content-Type: application/json
```

#### リクエストボディ

```json
{
  "reflection": "次回は1週間前から準備を始める"
}
```

#### 必須フィールド

- `reflection`: 振り返りの内容（文字列）

#### レスポンス

- ステータスコード: 200 OK

```json
{
  "id": 1,
  "content": "プレゼンの準備が不十分だった",
  "category": "努力不足",
  "reflection": "次回は1週間前から準備を始める",
  "points": 30,
  "created_at": "2024-02-24T12:00:00"
}
```

### 4. 失敗の記録の削除

指定したIDの失敗記録を削除します。関連する記録も一緒に削除されます。

#### リクエスト

```
DELETE /failures/{id}
```

#### レスポンス

- ステータスコード: 200 OK

```json
{
  "success": true
}
```

## エラーレスポンス

### 400 Bad Request

無効なリクエストデータの場合

```json
{
  "error": "カテゴリは必須です",
  "status": 400
}
```

### 404 Not Found

リソースが見つからない場合

```json
{
  "error": "指定されたリソースが見つかりません",
  "status": 404
}
```

### 500 Internal Server Error

サーバー内部でエラーが発生した場合

```json
{
  "error": "データベースエラー: UNIQUE constraint failed",
  "status": 500
}
```

## CORS

すべてのエンドポイントでCORSが有効になっています。以下のヘッダーが設定されます：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## データ型定義

### 失敗のカテゴリ

- `能力不足`: スキルや知識が不足していた場合
- `努力不足`: 準備や取り組みが不十分だった場合
- `環境`: 外部要因が主な原因だった場合
- `運`: 予測不可能な要因が影響した場合

### 内的要因

- `知識不足`: 必要な知識が不足していた
- `経験不足`: 経験が不足していた
- `集中力`: 集中力が維持できなかった
- `準備不足`: 準備が不十分だった

### 外的要因

- `時間制約`: 時間的な制約があった
- `リソース不足`: 必要なリソースが不足していた
- `外部依存`: 外部の要因に依存していた
- `環境要因`: 環境的な制約があった

### チャレンジタイプ

- `スキル向上`: 技術やスキルの向上を目指す
- `新しい方法`: 新しいアプローチを試みる
- `環境改善`: 環境の改善を行う
- `再挑戦`: 同じ課題に再度挑戦する

## 今後の改善予定

1. 認証機能の実装
   - Bearer認証
   - ユーザー管理機能

2. レート制限の導入
   - IPアドレスベースの制限
   - ユーザーベースの制限

3. 検索・フィルタリング機能
   - カテゴリによるフィルタリング
   - 日付範囲による検索
   - キーワード検索

4. 統計情報API
   - カテゴリごとの集計
   - 期間ごとの分析
   - 成長曲線の生成 