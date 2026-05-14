# CitiesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiCitiesGet**](#apicitiesget) | **GET** /api/cities | Get all cities|

# **apiCitiesGet**
> Array<ModelsCity> apiCitiesGet()

Возвращает список городов

### Example

```typescript
import {
    CitiesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CitiesApi(configuration);

const { status, data } = await apiInstance.apiCitiesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ModelsCity>**

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

