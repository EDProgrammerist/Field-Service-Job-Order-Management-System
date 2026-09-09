import api from "@/lib/axios";
import type {
  Customer,
  CustomerPayload,
  CustomerResponse,
  DeleteCustomerResponse,
} from "@/types/customer";
import type { PaginatedResponse } from "@/types/pagination";

export interface GetCustomersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export async function getCustomers(
  params: GetCustomersParams = {},
): Promise<PaginatedResponse<Customer>> {
  const response = await api.get<PaginatedResponse<Customer>>("/customers", {
    params,
  });

  return response.data;
}

export async function getAllCustomers(): Promise<Customer[]> {
  const firstResponse = await getCustomers({
    page: 1,
    per_page: 100,
  });

  const customers = [...firstResponse.data.data];

  for (
    let page = 2;
    page <= firstResponse.data.last_page;
    page += 1
  ) {
    const response = await getCustomers({
      page,
      per_page: 100,
    });

    customers.push(...response.data.data);
  }

  return customers;
}

export async function createCustomer(
  payload: CustomerPayload,
): Promise<CustomerResponse> {
  const response = await api.post<CustomerResponse>("/customers", payload);

  return response.data;
}

export async function updateCustomer(
  customerId: number,
  payload: CustomerPayload,
): Promise<CustomerResponse> {
  const response = await api.put<CustomerResponse>(
    `/customers/${customerId}`,
    payload,
  );

  return response.data;
}

export async function deleteCustomer(
  customerId: number,
): Promise<DeleteCustomerResponse> {
  const response = await api.delete<DeleteCustomerResponse>(
    `/customers/${customerId}`,
  );

  return response.data;
}