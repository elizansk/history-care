# ProfileApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiProfileGet**](#apiprofileget) | **GET** /api/profile | Get user profile|

# **apiProfileGet**
> ModelsUser apiProfileGet()

Возвращает информацию о текущем пользователе

### Example

```typescript
import {
    ProfileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProfileApi(configuration);

const { status, data } = await apiInstance.apiProfileGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ModelsUser**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Unauthorized |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

