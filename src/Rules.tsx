import React from "react";

interface RulesProps {
  onClose: () => void;
}

const Rules: React.FC<RulesProps> = ({ onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "90%",
          maxHeight: "90%",
          overflow: "auto",
          color: "#333",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          &times;
        </button>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Papír Foci Szabályok
        </h2>
        <ol style={{ paddingLeft: "20px" }}>
          <li>
            A játék egy négyzetrácsos papíron játszódik, ahol a vonalak
            metszéspontjai jelentik a lehetséges lépéseket.
          </li>
          <li>
            A játékosok felváltva lépnek, összekötve két szomszédos pontot egy
            vonallal.
          </li>
          <li>
            A labda (ami valójában a vonal végpontja) mindig a legutoljára
            húzott vonal végén van.
          </li>
          <li>
            Tilos olyan vonalat húzni, ami már létezik vagy átlósan keresztezi a
            pálya szélét.
          </li>
          <li>
            Ha egy játékos olyan pontba lép, ahol már járt korábban, extra
            lépést kap.
          </li>
          <li>A játék célja, hogy a labdát az ellenfél kapujába juttassuk.</li>
          <li>A kapu a pálya két szélén található, általában 3 pont magas.</li>
          <li>
            A játék akkor is véget ér, ha egy játékos nem tud szabályos lépést
            tenni. Ebben az esetben az ellenfél nyer.
          </li>
          <li>
            Stratégia: Próbálj olyan útvonalat kialakítani, ami több lehetőséget
            ad neked, és korlátozza az ellenfeledet.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Rules;
