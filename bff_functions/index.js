
export async function handler(req, res) {
    const data = await fetch("https://dogapi.dog/api/v2/breeds");

    res.send(await data.json());
}