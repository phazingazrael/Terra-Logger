// Get Cities with Pagination
fetch('http://localhost:3000/cities/1/5')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Country
fetch('http://localhost:3000/cities/country/Chaves')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Tag(s)
fetch('http://localhost:3000/cities/tags/City,Plaza')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Type
fetch('http://localhost:3000/cities/type/Large Town')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Size
fetch('http://localhost:3000/cities/size/Large Town')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// Get Cities by Features
fetch('http://localhost:3000/cities/features/Temple')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
