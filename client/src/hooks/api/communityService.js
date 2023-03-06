import { useDispatch, useSelector } from "react-redux"

const useCommunityService = () =>{
    const dispatch = useDispatch();

    const tokenFromStore = useSelector(state => state.auth.token);

    const getTrendingCommunities = async() =>{

    }

    const getSubscribedCommunities = async () =>{

    }

    

}

export default useCommunityService;