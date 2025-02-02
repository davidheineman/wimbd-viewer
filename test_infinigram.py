import requests

def search_documents(base_url, index, query, page=0, page_size=10, max_length=10):
    url = f"{base_url}/{index}/documents/"
    payload = {
        "search": query,
        "maximum_document_display_length": max_length,
        "page": page,
        "page_size": page_size
    }
    response = requests.get(url, params=payload)
    return response.json()

# Example usage
base_url = "https://infinigram-api.allen.ai/"
index = "dolma-1_7"
query = "test query"

response = search_documents(base_url, index, query)

# Print the result
print(response)