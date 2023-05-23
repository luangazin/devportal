import axios from "axios";

const GITHU_URL = "https://api.github.com/user/orgs";

export async function getOrgsGithub(token:string): Promise<string[] | undefined>{
    const headers = {
        Authorization: `Bearer ${token}`
    }
    try{
        const response = await axios.get( GITHU_URL ,{ headers });

        if (response.status === 200){
            const orgs = response.data;
            const orgsList = [];
            for( const org of orgs){
                orgsList.push(org.login as string)
            }
            return orgsList
        }
        else {
            // lançar um erro  --- ver se vou retornar um array vazio ou disparar um erro
            console.log('Error');
            return ["Not orgs"]
        }
    }
    catch(error){
        console.log('Error')
        return ["Not orgs"]
    }
}