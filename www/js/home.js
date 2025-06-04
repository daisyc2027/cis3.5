import { db } from './firebaseConfig.js';
import { getStorage, ref as storageRef, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.1.1/firebase-storage.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js';
document.addEventListener('DOMContentLoaded', () => {
  const storage = getStorage(); // Initialize Firebase Storage instance

  getDocs(collection(db, 'items'))
    .then((querySnapshot) => {
      const itemList = document.getElementById('recommendation'); // Get the container element
      let i = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data.closed);
        console.log('Document Data:', data);

        // Check if itemImageUrl is valid
        if (!data.itemImageUrl) {
          console.error('Invalid itemImageUrl:', data.itemImageUrl);
          return; // Skip this item if the URL is invalid
        }

        try {
          const imageUrl = new URL(data.itemImageUrl); // Ensure this URL is valid
          const pathName = imageUrl.pathname;
          const imageURL = pathName.substring(pathName.lastIndexOf('/') + 1);
          const imageRef = storageRef(storage, `${imageURL}`); // Construct the reference to the image file

          if (!data.closed) {
            getDownloadURL(imageRef) // Fetch the URL for the image
              .then((url) => {
                const div = document.createElement('div'); // Create a new div element
                div.innerHTML = `
                  <div class = "donation-item" style="width: 100px; height: auto; padding-bottom: 25px; left: ${Math.floor(i % 3) * 116}px; top: ${Math.floor(i / 3) * 170 + 45}px; position: absolute;">
                    <a href="product_info.html?itemId=${data.id}">
                      <div style="width: 100px; height: 110px; background-image: url('${url}'); background-size: contain; background-repeat: no-repeat; background-position: center center; border-radius: 8px;"></div>
                        <div class = "item-inner-div">
                      <div style="color: black; font-size: 14px; font-family: Inter; font-weight: 600; word-wrap: break-word;">${data.name}</div>
                      <div style="color: black; font-size: 14px; font-family: Inter; font-weight: 400; word-wrap: break-word;">${data.quantity}</div>
                      </div>
                      </a>
                  </div>`;

                itemList.appendChild(div); // Append the div to the container element
                i++;
                itemList.style.minHeight = `${(i / 3) * 170 + 200}px`;
              })
              .catch((error) => {
                console.error('Error getting download URL: ', error);
              });
          }

        } catch (error) {
          console.error('Error constructing URL from itemImageUrl:', error);
        }
      });

    })
    .catch((error) => {
      console.error('Error getting documents: ', error);
    });
});
