# CategoriesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiCategoriesGet**](#apicategoriesget) | **GET** /api/categories | Get all categories|

# **apiCategoriesGet**
> Array<ModelsBuildingCategory> apiCategoriesGet()

Возвращает список категорий

### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

const { status, data } = await apiInstance.apiCategoriesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ModelsBuildingCategory>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

