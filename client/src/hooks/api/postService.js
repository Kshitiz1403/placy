import { useDispatch, useSelector } from "react-redux"
import { getAuthenticatedAxios } from "./baseConfig";

const usePostService = () => {
    const dispatch = useDispatch();

    const tokenFromStore = useSelector(state => state.auth.token);

    const createPost = async (payload) => {
        try {
            const authenticatedAxios = getAuthenticatedAxios('/post', tokenFromStore)
            // const response = await authenticatedAxios.post('/63aea8509a711d06e4b6a3c3', { payload })
            const response = await authenticatedAxios.post('/', { payload })
            return response
        } catch (e) {

        }
    }

    return { createPost }

}

export default usePostService;