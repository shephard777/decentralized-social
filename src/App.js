import { useEffect, useState } from "react";
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications,
} from "./queres";
import LENSHUB from "./lenshub.json";
import { BrowserProvider } from "ethers";
import { Box, Button, Image } from "@chakra-ui/react";

function App() {
  const [account, setAccount] = useState([]);
  const [profiles, setProfiles] = useState([]);
  console.log("~profiles", profiles);
  const [posts, setPosts] = useState([]);
  console.log("~posts", posts);

  async function signIn() {
    const accounts = await window.ethereum.resquest({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  }

  async function getRecommendedProfiles() {
    const response = await urlClient
      .query(queryRecommendedProfiles)
      .toPromise();
      
    const profiles = response.data.recommendedProfiles.slice(0,5);
    setProfiles(profiles);
  }
  
  async function getPosts() {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();
      
    const posts = response.data.explorePublications.items.filter((post) =>{
      if(post.profile) return post;
      return "";
    });
    setPosts(posts);
  }
  
  async function follow(id){
    const provider = new BrowserProvider.providers.Web3Provider(window.ethereum);
    const contract = new BrowserProvider.Contract(
      LENS_HUB_CONTRACT_ADDRESS,
      LENSHUB,
      provider.getSigner()
    );
    const tx = await contract.follow([parseInt(id)], [0x0]);
    await tx.wait();
  }
  
  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  })
  
  
  return <div className="app">
    <Box width="100%" backgroundColor="rgba(5, 32, 64, 28)">
      <Box  
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="55%"
        margin="auto"
        color="white"
        padding="10px 0"
      >
        <Box fontFamily="DM Serif Display" fontSize="44px" fontStyle="italic">
          WEB3 Dominican
        </Box>
        <Box>Red social descentralizada App</Box>
        { account ? (
          <Box backgroundColor="000" padding="15px" borderRadius="6pc">
            Conectado
          </Box>
        ) : <Button onClick={signIn} color="rgba(5,32,64)" _hover={{backgroundColor: "#080808"}}>
          Conectar
        </Button>
        }
      </Box>
    </Box>
    
    {/**Content */}
    <Box
      display="flex"
      justifyContent="space-between"
      width="55%"
      margin="35px auto auto auto"
      color="white"
    >
      {/**Posts */}
      <Box width="65%" maxWidth="65%" minWidth="65%">
        {posts.map((post) => (
          <Box
            key={post.id}
            marginBottom="rgba(5,32,64,28)"
            padding="40px 30px 40px 25px"
            borderRadius="6px"
          >
            <Box display="flex">
              {/**Profile Image */}
              <Box width="75px" height="75px" marginTop="8px">
                <img
                  alt="profile"
                  src={post.profile ? post.profile.picture?.original?.url : "/default-avatar.png"} width="75px" height="75px" onError={({currentTarget}) => {
                    currentTarget.onerror = null; // prevent looping
                    currentTarget.src = "/default-avatar.png"
                  }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </div>;
}

export default App;
