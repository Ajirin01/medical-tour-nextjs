const API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_BASE_URL || "http://localhost:5000";

// Helper to add timeout
async function fetchWithTimeout(resource, options = {}, timeout = 10000) { // default 10s
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Fetch Data (GET)
export async function fetchData(endpoint, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, { headers });

    if (!res.ok) {
      const errorResponse = await res.json();
      throw new Error(errorResponse.message || `Error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

// Post Data (POST)
export async function postData(endpoint, data, token = null, isFormData = false) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      }
    : { "Content-Type": "application/json" };

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      throw new Error(errorResponse.message || `Error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Post Error:", error);
    throw error;
  }
}

// Update Data (PUT or PATCH)
export async function updateData(endpoint, data, token, isFormData = false) {
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      }
    : {};

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      throw new Error(errorResponse.message || `Error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Update Error:", error);
    throw error;
  }
}

// Delete Data (DELETE)
export async function deleteData(endpoint, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/${endpoint}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const errorResponse = await res.json();
      throw new Error(errorResponse.message || `Error: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Delete Error:", error);
    throw error;
  }
}
