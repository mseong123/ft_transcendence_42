const Tournament = artifacts.require("Tournament");

module.exports = function(deployer) {
  deployer.deploy(Tournament).then((instance) => {
    console.log('Contract deployed at address:', instance.address);
  });
};
