# OrdersServicesApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiOrdersIdServicesPost**](#apiordersidservicespost) | **POST** /api/orders/{id}/services | Add multiple services to draft order|
|[**apiOrdersServicesPost**](#apiordersservicespost) | **POST** /api/orders/services | Add service to draft order|
|[**apiOrdersServicesServiceIdDelete**](#apiordersservicesserviceiddelete) | **DELETE** /api/orders/services/{service_id} | Delete service from draft|
|[**apiOrdersServicesServiceIdPut**](#apiordersservicesserviceidput) | **PUT** /api/orders/services/{service_id} | Update service price in draft|

# **apiOrdersIdServicesPost**
> { [key: string]: string; } apiOrdersIdServicesPost(bulkAddServicesRequest)

Добавляет несколько услуг к заявке (массовое добавление)

### Example

```typescript
import {
    OrdersServicesApi,
    Configuration,
    HandlerBulkAddServicesRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersServicesApi(configuration);

let id: number; //Order ID (default to undefined)
let bulkAddServicesRequest: HandlerBulkAddServicesRequest; //Services with quantities and descriptions

const { status, data } = await apiInstance.apiOrdersIdServicesPost(
    id,
    bulkAddServicesRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **bulkAddServicesRequest** | **HandlerBulkAddServicesRequest**| Services with quantities and descriptions | |
| **id** | [**number**] | Order ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersServicesPost**
> { [key: string]: string; } apiOrdersServicesPost(addServiceToDraftRequest)

Добавляет услугу в заявку-черновик

### Example

```typescript
import {
    OrdersServicesApi,
    Configuration,
    HandlerAddServiceToDraftRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersServicesApi(configuration);

let addServiceToDraftRequest: HandlerAddServiceToDraftRequest; //service_id + price

const { status, data } = await apiInstance.apiOrdersServicesPost(
    addServiceToDraftRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addServiceToDraftRequest** | **HandlerAddServiceToDraftRequest**| service_id + price | |


### Return type

**{ [key: string]: string; }**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersServicesServiceIdDelete**
> { [key: string]: string; } apiOrdersServicesServiceIdDelete()

Удаляет услугу из заявки-черновика

### Example

```typescript
import {
    OrdersServicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersServicesApi(configuration);

let serviceId: number; //Service ID (default to undefined)

const { status, data } = await apiInstance.apiOrdersServicesServiceIdDelete(
    serviceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **serviceId** | [**number**] | Service ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

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

# **apiOrdersServicesServiceIdPut**
> { [key: string]: string; } apiOrdersServicesServiceIdPut(updateServiceInDraftRequest)

Изменяет стоимость услуги в заявке

### Example

```typescript
import {
    OrdersServicesApi,
    Configuration,
    HandlerUpdateServiceInDraftRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersServicesApi(configuration);

let serviceId: number; //Service ID (default to undefined)
let updateServiceInDraftRequest: HandlerUpdateServiceInDraftRequest; //price and description

const { status, data } = await apiInstance.apiOrdersServicesServiceIdPut(
    serviceId,
    updateServiceInDraftRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateServiceInDraftRequest** | **HandlerUpdateServiceInDraftRequest**| price and description | |
| **serviceId** | [**number**] | Service ID | defaults to undefined|


### Return type

**{ [key: string]: string; }**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

