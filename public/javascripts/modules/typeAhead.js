const axios = require('axios');

function typeAhead(search) {
  if(!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function(){
    // Stop function if no values
    if(!this.value){
      searchResults.style.display = 'none';
      return
    }
    searchResults.style.display = 'block'

    axios.get(`/api/v1/search?q=${this.value}`)
      .then(res => {
        if(res.data.length){
          console.log('results found')
        }
      })
  })

}

export default typeAhead;
