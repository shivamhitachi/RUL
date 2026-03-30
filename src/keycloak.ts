import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080/',
  realm: 'RULRealm',
  clientId: 'react-client',
});

export default keycloak;