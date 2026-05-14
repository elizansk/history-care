# ServicesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiServicesGet**](#apiservicesget) | **GET** /api/services | Get services not delited|
|[**apiServicesIdDelete**](#apiservicesiddelete) | **DELETE** /api/services/{id} | Delete service|
|[**apiServicesIdGet**](#apiservicesidget) | **GET** /api/services/{id} | Get service by id|
|[**apiServicesPost**](#apiservicespost) | **POST** /api/services | Create service|

# **apiServicesGet**
> Array<ModelsService> apiServicesGet()

Возвращает список не удаленных услуг

### Example

```typescript
import {
    ServicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServicesApi(configuration);

const { status, data } = await apiInstance.apiServicesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ModelsService>**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiServicesIdDelete**
> { [key: string]: string; } apiServicesIdDelete()

Удаление услуги (status = deleted)

### Example

```typescript
import {
    ServicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServicesApi(configuration);

let id: number; //Service ID (default to undefined)

const { status, data } = await apiInstance.apiServicesIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Service ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiServicesIdGet**
> ModelsService apiServicesIdGet()


### Example

```typescript
import {
    ServicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServicesApi(configuration);

let id: number; //Service ID (default to undefined)

const { status, data } = await apiInstance.apiServicesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Service ID | defaults to undefined|


### Return type

**ModelsService**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiServicesPost**
> ModelsService apiServicesPost()


### Example

```typescript
import {
    ServicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServicesApi(configuration);

let name: string; //Service name (default to undefined)
let image: File; //Image file (default to undefined)
let description: string; //Description (optional) (default to undefined)
let video: File; //Video file (optional) (default to undefined)

const { status, data } = await apiInstance.apiServicesPost(
    name,
    image,
    description,
    video
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **name** | [**string**] | Service name | defaults to undefined|
| **image** | [**File**] | Image file | defaults to undefined|
| **description** | [**string**] | Description | (optional) defaults to undefined|
| **video** | [**File**] | Video file | (optional) defaults to undefined|


### Return type

**ModelsService**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

