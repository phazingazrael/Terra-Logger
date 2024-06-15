
import BookLoaderImage from '../../assets/BookLoader.png';

function BookLoader() {
  return (
    <div className="citiesLoader">
      <h2>Loading...</h2>
      <img src={BookLoaderImage} alt="" />
    </div>
  );
}

export default BookLoader;
