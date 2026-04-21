export function useLoginForm() {

    const handleLogin = ({email, password}:{
        email:string, password:string
    }) => {
        const result = useLogin(email, password)
        
    };
    return {
        handleLogin
    }
}



