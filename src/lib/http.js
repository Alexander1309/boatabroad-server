const axios = require('axios')
const http = {}

http.Get = async url => await (await axios.get(url)).data

http.Post = async (url, data) => await (await axios.post(url, data)).data

http.Put = async (url, data) => await (await axios.put(url, data)).data

http.Delete = async url => await (await axios.delete(url)).data

module.exports = http