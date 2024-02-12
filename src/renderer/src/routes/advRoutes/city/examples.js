// Get Cities with Pagination:
// Endpoint: /cities/1/5  (Get the first page of 5 cities)
fetch('http://localhost:3000/cities/1/5')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Country:
// Endpoint: /cities/country/Chaves (Get cities in the country "Chaves")
fetch('http://localhost:3000/cities/country/Chaves')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Tag(s)
// Endpoint: /cities/tags/City,Plaza (Get cities with tags "City" or "Plaza")
fetch('http://localhost:3000/cities/tags/City,Plaza')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Type
//Endpoint: "/cities/type/Large Town" (Get cities of type "Large Town")
fetch('http://localhost:3000/cities/type/Large Town')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Size
// Endpoint: /cities/size/Large Town (Get cities of size "Large Town")
fetch('http://localhost:3000/cities/size/Large Town')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Features
// Endpoint: /cities/features/Temple (Get cities with the feature "Temple")
fetch('http://localhost:3000/cities/features/Temple')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
