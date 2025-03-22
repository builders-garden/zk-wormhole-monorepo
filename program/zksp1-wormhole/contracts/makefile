deploy-zk-wrm:
	forge script script/DeployWormholeWrapper.s.sol:DeployWormholeWrapper \
  	--rpc-url https://ethereum-holesky-rpc.publicnode.com \
	--sig "run(address)"  $(TOKEN) \
  	--broadcast \
  	--account trifecta \
  	--verify \
  	--etherscan-api-key $(ETHERSCAN_API_KEY) \
  	--chain holesky \



deploy-erc20:
	forge script script/DeployERC20.s.sol:DeployERC20 \
	  --rpc-url https://ethereum-holesky-rpc.publicnode.com \
	  --sig "run(address)"  $(ADDITIONAL_RECEIVER) \
	  --broadcast \
	  --account trifecta \
	  --verify \
	  --etherscan-api-key $(ETHERSCAN_API_KEY) \
	  --chain holesky \
	  -vvvv

test:
	forge test