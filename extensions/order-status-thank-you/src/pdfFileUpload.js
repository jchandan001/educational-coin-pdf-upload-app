export async function uploadPdfOnAWS(url, method) {
  try {
    console.log(url, method, "url, method");
    const response = await fetch(url, {
      method,
mode: 'no-cors',
    });

    const data = await response.json();
    console.log(data, "data**************8");
    return data;
  } catch (error) {
    console.log(error, "error while uploading pdf on s3");
    throw error;
  }
}
