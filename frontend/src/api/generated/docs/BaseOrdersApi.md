# BaseOrdersApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiOrdersFormedGet**](#apiordersformedget) | **GET** /api/orders/formed | Get donatable orders|

# **apiOrdersFormedGet**
> Array<ModelsReconstructionOrder> apiOrdersFormedGet()

список заявок с фильтрацией (только заявки formed и connelction started)

### Example

```typescript
import {
    BaseOrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BaseOrdersApi(configuration);

let categoryId: number; //Category Id (optional) (default to undefined)
let cityId: number; //City Id (optional) (default to undefined)
let from: string; //date from (YYYY-MM-DD) (optional) (default to undefined)
let to: string; //date to (YYYY-MM-DD) (optional) (default to undefined)

const { status, data } = await apiInstance.apiOrdersFormedGet(
    categoryId,
    cityId,
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**number**] | Category Id | (optional) defaults to undefined|
| **cityId** | [**number**] | City Id | (optional) defaults to undefined|
| **from** | [**string**] | date from (YYYY-MM-DD) | (optional) defaults to undefined|
| **to** | [**string**] | date to (YYYY-MM-DD) | (optional) defaults to undefined|


### Return type

**Array<ModelsReconstructionOrder>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

