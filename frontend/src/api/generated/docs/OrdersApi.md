# OrdersApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiOrdersDraftGet**](#apiordersdraftget) | **GET** /api/orders/draft | Get draft order (cart)|
|[**apiOrdersDraftPost**](#apiordersdraftpost) | **POST** /api/orders/draft | Create draft order|
|[**apiOrdersGet**](#apiordersget) | **GET** /api/orders | Get orders|
|[**apiOrdersIdDelete**](#apiordersiddelete) | **DELETE** /api/orders/{id} | Delete order|
|[**apiOrdersIdFormPut**](#apiordersidformput) | **PUT** /api/orders/{id}/form | Form order|
|[**apiOrdersIdGet**](#apiordersidget) | **GET** /api/orders/{id} | |
|[**apiOrdersIdModeratePut**](#apiordersidmoderateput) | **PUT** /api/orders/{id}/moderate | Finish order (admin)|
|[**apiOrdersIdPut**](#apiordersidput) | **PUT** /api/orders/{id} | Update order fields|
|[**apiOrdersPost**](#apiorderspost) | **POST** /api/orders | Create final order from draft|

# **apiOrdersDraftGet**
> ApiOrdersDraftGet200Response apiOrdersDraftGet()

Возвращает текущую черновую заявку пользователя (корзину). Если черновика нет — создаёт новый.

### Example

```typescript
import {
    OrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

const { status, data } = await apiInstance.apiOrdersDraftGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ApiOrdersDraftGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Draft order info |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersDraftPost**
> ModelsReconstructionOrder apiOrdersDraftPost(createDraftOrderRequest)


### Example

```typescript
import {
    OrdersApi,
    Configuration,
    HandlerCreateDraftOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let createDraftOrderRequest: HandlerCreateDraftOrderRequest; //Building id and order details

const { status, data } = await apiInstance.apiOrdersDraftPost(
    createDraftOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createDraftOrderRequest** | **HandlerCreateDraftOrderRequest**| Building id and order details | |


### Return type

**ModelsReconstructionOrder**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersGet**
> Array<ModelsReconstructionOrder> apiOrdersGet()

список заявок с фильтрацией (доступ ограничен ролями)

### Example

```typescript
import {
    OrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let status: string; //status (formed/ finished) (optional) (default to undefined)
let from: string; //date from (YYYY-MM-DD) (optional) (default to undefined)
let to: string; //date to (YYYY-MM-DD) (optional) (default to undefined)

const { status, data } = await apiInstance.apiOrdersGet(
    status,
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | [**string**] | status (formed/ finished) | (optional) defaults to undefined|
| **from** | [**string**] | date from (YYYY-MM-DD) | (optional) defaults to undefined|
| **to** | [**string**] | date to (YYYY-MM-DD) | (optional) defaults to undefined|


### Return type

**Array<ModelsReconstructionOrder>**

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
|**403** | Forbidden |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersIdDelete**
> { [key: string]: string; } apiOrdersIdDelete()

Логическое удаление заявки (только владелец)

### Example

```typescript
import {
    OrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //Order ID (default to undefined)

const { status, data } = await apiInstance.apiOrdersIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Order ID | defaults to undefined|


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
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersIdFormPut**
> { [key: string]: any; } apiOrdersIdFormPut()

Формирование заявки (расчет суммы)

### Example

```typescript
import {
    OrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //Order ID (default to undefined)

const { status, data } = await apiInstance.apiOrdersIdFormPut(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Order ID | defaults to undefined|


### Return type

**{ [key: string]: any; }**

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersIdGet**
> ModelsReconstructionOrder apiOrdersIdGet()

Получение заявки (только владелец)

### Example

```typescript
import {
    OrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //Order ID (default to undefined)

const { status, data } = await apiInstance.apiOrdersIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Order ID | defaults to undefined|


### Return type

**ModelsReconstructionOrder**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**403** | Forbidden |  -  |
|**404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersIdModeratePut**
> { [key: string]: string; } apiOrdersIdModeratePut()

Завершение или отклонение заявки

### Example

```typescript
import {
    OrdersApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //Order ID (default to undefined)
let status: string; //finish or reject (default to undefined)

const { status, data } = await apiInstance.apiOrdersIdModeratePut(
    id,
    status
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Order ID | defaults to undefined|
| **status** | [**string**] | finish or reject | defaults to undefined|


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersIdPut**
> { [key: string]: string; } apiOrdersIdPut(updateOrderRequest)

Редактирование заявки (только если draft)

### Example

```typescript
import {
    OrdersApi,
    Configuration,
    HandlerUpdateOrderRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let id: number; //Order ID (default to undefined)
let updateOrderRequest: HandlerUpdateOrderRequest; //building fields

const { status, data } = await apiInstance.apiOrdersIdPut(
    id,
    updateOrderRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateOrderRequest** | **HandlerUpdateOrderRequest**| building fields | |
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
|**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiOrdersPost**
> ModelsReconstructionOrder apiOrdersPost(orderId)

Завершает черновую заявку и создает финальный заказ

### Example

```typescript
import {
    OrdersApi,
    Configuration,
    ApiOrdersPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new OrdersApi(configuration);

let orderId: ApiOrdersPostRequest; //Draft order ID

const { status, data } = await apiInstance.apiOrdersPost(
    orderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **orderId** | **ApiOrdersPostRequest**| Draft order ID | |


### Return type

**ModelsReconstructionOrder**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |
|**400** | Bad Request |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

