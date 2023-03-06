import { useDispatch, useSelector } from "react-redux"
import { getAuthenticatedAxios } from "./baseConfig";

const useTagService = () => {
    const dispatch = useDispatch();

    const tokenFromStore = useSelector(state => state.auth.token);

    const getTags = async () => {
        try {
            const authenticatedAxios = getAuthenticatedAxios('/tags', tokenFromStore)
            const response = await authenticatedAxios.get('/')
            return response
        } catch (e) {

        }
    }

    return { getTags }

}

export default useTagService;