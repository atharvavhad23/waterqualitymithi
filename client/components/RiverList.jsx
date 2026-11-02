import { useEffect, useState } from "react";
import axios from "axios";

const RiverList = () => {
  const [rivers, setRivers] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/rivers/")
      .then((res) => setRivers(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      {rivers.map((river) => (
        <div key={river.id}>
          {river.name} - Pollution Level: {river.pollution_level}
        </div>
      ))}
    </div>
  );
};

export default RiverList;
