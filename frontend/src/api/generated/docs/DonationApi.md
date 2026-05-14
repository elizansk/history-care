# DonationApi

All URIs are relative to *http://localhost:8080*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**apiDonationsPost**](#apidonationspost) | **POST** /api/donations | Post a donation|

# **apiDonationsPost**
> HandlerDonationResponse apiDonationsPost(donationRequest)

Добавляет пожертвование на заявку

### Example

```typescript
import {
    DonationApi,
    Configuration,
    HandlerDonationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new DonationApi(configuration);

let donationRequest: HandlerDonationRequest; //Donation data

const { status, data } = await apiInstance.apiDonationsPost(
    donationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **donationRequest** | **HandlerDonationRequest**| Donation data | |


### Return type

**HandlerDonationResponse**

### Authorization

No authorization required

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

