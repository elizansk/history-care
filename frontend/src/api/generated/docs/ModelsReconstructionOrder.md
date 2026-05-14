# ModelsReconstructionOrder


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**building** | [**ModelsBuilding**](ModelsBuilding.md) |  | [optional] [default to undefined]
**building_id** | **number** |  | [optional] [default to undefined]
**collected_amount** | **number** |  | [optional] [default to undefined]
**completed_at** | **string** |  | [optional] [default to undefined]
**created_at** | **string** |  | [optional] [default to undefined]
**creator** | [**ModelsUser**](ModelsUser.md) |  | [optional] [default to undefined]
**creator_id** | **number** |  | [optional] [default to undefined]
**donations** | [**Array&lt;ModelsDonation&gt;**](ModelsDonation.md) |  | [optional] [default to undefined]
**id** | **number** |  | [optional] [default to undefined]
**moderator_id** | **number** |  | [optional] [default to undefined]
**services** | [**Array&lt;ModelsOrderService&gt;**](ModelsOrderService.md) |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**total_amount** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { ModelsReconstructionOrder } from './api';

const instance: ModelsReconstructionOrder = {
    building,
    building_id,
    collected_amount,
    completed_at,
    created_at,
    creator,
    creator_id,
    donations,
    id,
    moderator_id,
    services,
    status,
    total_amount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
