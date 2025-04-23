const API_BASE_URL = process.env.NEXT_PUBLIC_NODE_API_BASE_URL || "http://localhost:5000";

// Fetch Data (GET)
export async function fetchData(endpoint, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  console.log(token)

  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, { headers });

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
        ...(isFormData ? {} : { "Content-Type": "application/json" }),  // Handle content type properly
      }
    : { "Content-Type": "application/json" }; // Default to JSON if no token

  console.log("Headers:", headers); // Debug the headers
  console.log("Data being sent:", data); // Debug the data being sent

  try {
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data), // Convert body to JSON unless it's FormData
    });

    console.log("Response Status:", res.status); // Debug response status

    if (!res.ok) {
      const errorResponse = await res.json();
      console.error("Error response:", errorResponse);  // Debug error response
      throw new Error(errorResponse.message || `Error: ${res.statusText}`);
    }

    return await res.json();  // Parse and return the JSON response
  } catch (error) {
    console.error("API Post Error:", error);  // Log any error during the request
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
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
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
    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
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
