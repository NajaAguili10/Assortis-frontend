# Matching Projects Pipeline API Contract

## Matching Opportunities

`GET /matching-opportunities`

Query parameters:
- `type`: `OPEN_PROJECT`, `CONTRACT_AWARD`, or `SHORTLIST`
- `status`: `active`, `discarded`, or `all`
- `search`: free-text query across title, donor, country, sectors, and keywords
- `country`, `minScore`, `publishedFrom`, `publishedTo`, `sort`

`POST /matching-opportunities/:projectId/discard`

Moves an open project out of the matching inbox and into the Bin for the current user.

`POST /matching-opportunities/:projectId/restore`

Restores a discarded open project to the matching inbox for the current user.

`DELETE /matching-opportunities/:projectId/discard`

Optional permanent removal from the user-visible Bin.

## Project Pipeline

`GET /projects/pipeline`

Returns current user's pipeline entries, including project metadata needed for list rendering.

`POST /projects/pipeline`

Upserts a pipeline entry.

```json
{
  "projectId": "opp-001",
  "currentStage": "eoi_preparation"
}
```

`PATCH /projects/pipeline/:pipelineId/stage`

Updates the current stage and creates a stage-history row.

```json
{
  "currentStage": "tender_preparation"
}
```

`GET /projects/pipeline/:pipelineId/history`

Returns ordered stage changes for the pipeline entry.

## Suggested Schema

`project_pipeline`
- `id`
- `user_id`
- `project_id`
- `current_stage`
- `discarded`
- `created_at`
- `updated_at`
- `stage_updated_at`

`project_stage_history`
- `id`
- `project_pipeline_id`
- `old_stage`
- `new_stage`
- `changed_by`
- `changed_at`
