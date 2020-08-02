import ReactDOM from 'react-dom'
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import './index.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

extend({OrbitControls});

const DEAD = 0;
const ALIVE = 1;

function Controls(props) {
  const controls = useRef()
  const { camera, gl } = useThree()
  camera.position.z = 20;
  camera.position.y = 5;
  camera.position.x = -10;
  useFrame(() => controls.current && controls.current.update( ))
  return <orbitControls ref={controls} target={[5, 5, 5]} rotationSpeed={1} args={[camera, gl.domElement]} {...props} autoRotate={true} />
}


class Game {
   constructor() {
     this.width = 10;
     this.height = 100;
     this.seed();
   }

   seed() {
    this.grid = new Array(this.width*this.height).fill(0);
    this.grid.forEach((item, idx) => {
      this.grid[idx] = Math.round(Math.random());
    })
    this.deltas = [];
   }

   getCell(idx) {
     let real_idx = 0;
     if (idx > this.grid.length) {
       real_idx = idx % this.grid.length;
     } else if (idx < 0) {
       real_idx = (this.grid.length - idx);
     } else {
       real_idx = idx;
     }
     return this.grid[real_idx];
   }

   liveNeighbours(idx) {
     let neighbours = [];
     neighbours.push( this.getCell(idx - 1) );
     neighbours.push( this.getCell(idx + 1) );
     neighbours.push( this.getCell(idx + this.width) );
     neighbours.push( this.getCell(idx - this.width) );
     neighbours.push( this.getCell(idx + this.width + 1) );
     neighbours.push( this.getCell(idx + this.width - 1) );
     neighbours.push( this.getCell(idx - this.width - 1) );
     neighbours.push( this.getCell(idx - this.width + 1) );
     return neighbours.reduce((total, el) => total + el);
   }

   step() {
     let newGrid = this.grid.map((cell, idx) => {
      if (cell == ALIVE && this.liveNeighbours(idx) < 2) {
        return DEAD;
      } else if (cell == ALIVE && (this.liveNeighbours(idx) == 2 || this.liveNeighbours(idx) == 3)) {
        return ALIVE;
      } else if (cell == ALIVE && this.liveNeighbours(idx) > 3) {
        return DEAD;
      } else if (cell == DEAD && this.liveNeighbours(idx) == 3) {
        return ALIVE;
      } else {
        return DEAD;
      }
     })
     this.grid = newGrid;
   }
}

function GameSystem(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef()
  
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const [count, setCount] = useState(0);
  const { camera, scene } = useThree(); 
  const game = useRef(new Game);

  const restart = () => {
    game.current.seed();
  }

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    setCount((count) => count + 1);
    if ((count % 6) == 0) {
      game.current.step()
    }
  })

  const translatePosition = (idx) => {
    let [x, y, z] = idx.toString().split('').map((i) => parseInt(i))
    return [x, y, z];
  }

  return game.current.grid.map((cell, idx) => {
    return ((cell == ALIVE) ? (<mesh
      position={translatePosition(idx)}
      onClick={restart}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" color={'#a3c7ff'} />
    </mesh>) : null)
  });

}

ReactDOM.render(
  <body>
  <Canvas>
    <ambientLight intensity={0.2} />
    <pointLight position={[20, 20, 20]} />
    <pointLight position={[-20, 20, -20]} />
    <GameSystem position={[-1.2, 0, 0]} />
    <Controls />
  </Canvas>
  </body>,
  document.getElementById('root'))