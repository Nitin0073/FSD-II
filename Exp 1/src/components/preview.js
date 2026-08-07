function Preview({
    platform,
    post,
    image
}) {


return(

<div className="preview">


<h2>
Live Preview
</h2>



<h3>
{platform}
</h3>



{

image &&

<img

src={image}

alt="preview"

className="previewImage"

/>

}





<div className="previewBox">


{

post ||

"Your post will appear here..."

}


</div>



</div>


);


}


export default Preview;