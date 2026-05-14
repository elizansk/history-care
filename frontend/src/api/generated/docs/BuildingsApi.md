# BuildingsApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiBuildingsIdPut**](#apibuildingsidput) | **PUT** /api/buildings/{id} | Update building|
|[**apiBuildingsPost**](#apibuildingspost) | **POST** /api/buildings | Create building|

# **apiBuildingsIdPut**
> ModelsBuilding apiBuildingsIdPut()


### Example

```typescript
import {
    BuildingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildingsApi(configuration);

let id: number; //Building ID (default to undefined)
let name: string; //Building name (optional) (default to undefined)
let description: string; //Description (optional) (default to undefined)
let address: string; //Address (optional) (default to undefined)
let categoryId: number; //Category ID (optional) (default to undefined)
let cityId: number; //City ID (optional) (default to undefined)
let files: Array<File>; //Photos + Videos (optional) (default to undefined)

const { status, data } = await apiInstance.apiBuildingsIdPut(
    id,
    name,
    description,
    address,
    categoryId,
    cityId,
    files
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Building ID | defaults to undefined|
| **name** | [**string**] | Building name | (optional) defaults to undefined|
| **description** | [**string**] | Description | (optional) defaults to undefined|
| **address** | [**string**] | Address | (optional) defaults to undefined|
| **categoryId** | [**number**] | Category ID | (optional) defaults to undefined|
| **cityId** | [**number**] | City ID | (optional) defaults to undefined|
| **files** | **Array&lt;File&gt;** | Photos + Videos | (optional) defaults to undefined|


### Return type

**ModelsBuilding**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**404** | Not Found |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiBuildingsPost**
> ModelsBuilding apiBuildingsPost()


### Example

```typescript
import {
    BuildingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildingsApi(configuration);

let name: string; //Building name (default to undefined)
let address: string; //Address (default to undefined)
let categoryId: number; //Category ID (default to undefined)
let files: Array<File>; //Photos + Videos (default to undefined)
let description: string; //Description (optional) (default to undefined)
let cityId: number; //City ID (only for admin) (optional) (default to undefined)

const { status, data } = await apiInstance.apiBuildingsPost(
    name,
    address,
    categoryId,
    files,
    description,
    cityId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **name** | [**string**] | Building name | defaults to undefined|
| **address** | [**string**] | Address | defaults to undefined|
| **categoryId** | [**number**] | Category ID | defaults to undefined|
| **files** | **Array&lt;File&gt;** | Photos + Videos | defaults to undefined|
| **description** | [**string**] | Description | (optional) defaults to undefined|
| **cityId** | [**number**] | City ID (only for admin) | (optional) defaults to undefined|


### Return type

**ModelsBuilding**

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

