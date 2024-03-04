// implementing social login on front end
const baseUrl = "https://api.intra.42.fr";
const client_id = "u-s4t2ud-e98273ec7275fa5dcc7a965135189ae2ca2dfc9eeb445944d2ea02d0a5645a2d";
const redirect_uri = `http://127.0.0.1:8000/`;

const generateRandomState=()=> {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

const redirectToFourtyTwo = () => {
    const state = generateRandomState();
    const nonce = generateRandomState();
    const urlParams = {
        client_id,
        redirect_uri,
        response_type: "code",
        nonce,
        state,
    };
    const conectionURI = new URL(`${baseUrl}/oauth/authorize?`);
    for(const key of Object.keys(urlParams)){
        conectionURI.searchParams.append(key, urlParams[key]);
    }
    window.location.href = conectionURI;
}