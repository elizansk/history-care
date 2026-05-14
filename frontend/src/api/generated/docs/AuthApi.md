# AuthApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiAuthLoginPost**](#apiauthloginpost) | **POST** /api/auth/login | User login|
|[**apiAuthLogoutPost**](#apiauthlogoutpost) | **POST** /api/auth/logout | User logout|
|[**apiAuthRegisterPost**](#apiauthregisterpost) | **POST** /api/auth/register | Register a new user|

# **apiAuthLoginPost**
> { [key: string]: any; } apiAuthLoginPost(loginRequest)

Логин пользователя, возвращает JWT

### Example

```typescript
import {
    AuthApi,
    Configuration,
    HandlerLoginRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let loginRequest: HandlerLoginRequest; //Login credentials

const { status, data } = await apiInstance.apiAuthLoginPost(
    loginRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginRequest** | **HandlerLoginRequest**| Login credentials | |


### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Bad Request |  -  |
|**401** | Unauthorized |  -  |
|**500** | Internal Server Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthLogoutPost**
> { [key: string]: any; } apiAuthLogoutPost()

выход пользователя

### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.apiAuthLogoutPost();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **apiAuthRegisterPost**
> { [key: string]: any; } apiAuthRegisterPost(registerRequest)

Создает нового пользователя и возвращает JWT

### Example

```typescript
import {
    AuthApi,
    Configuration,
    HandlerRegisterRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let registerRequest: HandlerRegisterRequest; //User registration data

const { status, data } = await apiInstance.apiAuthRegisterPost(
    registerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerRequest** | **HandlerRegisterRequest**| User registration data | |


### Return type

**{ [key: string]: any; }**

### Authorization

No authorization required

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

