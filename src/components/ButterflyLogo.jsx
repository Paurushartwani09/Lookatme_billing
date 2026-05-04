import logo from "../assets/logo.png";
export default function ButterflyLogo({
  size      = 40,
  opacity   = 0.95,
  stemColor = 'rgba(255,255,255,0.55)',
  shadow    = false,
  style     = {},
  className = '',
}) {
  const o = opacity;
  return (
   <img src={logo} alt="" width={size} height={size}/>
  );
}