import { useDispatch, useSelector } from "react-redux"
import { getAuthenticatedAxios } from "./baseConfig";

const useCommunityService = () => {
    const dispatch = useDispatch();

    const tokenFromStore = useSelector(state => state.auth.token);

    const getTrendingCommunities = async () => {

    }

    const getSubscribedCommunities = async () => {
        try {
            const authenticatedAxios = getAuthenticatedAxios('/community', tokenFromStore)
            const response = await authenticatedAxios.get('/my')
            return response
        } catch (e) {

        }
    }

    return { getSubscribedCommunities }

}

export default useCommunityService;