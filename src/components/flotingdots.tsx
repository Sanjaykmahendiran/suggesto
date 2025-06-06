const FloatingDots = () => {
  const dots = [
    { id: 1, size: 8, color: '#ff00f7', delay: 0, radius: 90, angle: 30 },
    { id: 2, size: 6, color: '#a85aff', delay: 1, radius: 95, angle: 120 },
    { id: 3, size: 10, color: '#00e0ff', delay: 2, radius: 85, angle: 200 },
    { id: 4, size: 4, color: '#ff00f7', delay: 0.5, radius: 100, angle: 310 },
    { id: 5, size: 7, color: '#a85aff', delay: 1.5, radius: 80, angle: 45 },
    { id: 6, size: 5, color: '#00e0ff', delay: 2.5, radius: 105, angle: 150 },
    { id: 7, size: 9, color: '#ff00f7', delay: 3, radius: 90, angle: 270 },
    { id: 8, size: 6, color: '#a85aff', delay: 0.8, radius: 95, angle: 350 }
  ];

  return (
    <>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full opacity-80 animate-pulse"
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            boxShadow: `0 0 ${dot.size * 2}px ${dot.color}`,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${
              Math.cos((dot.angle * Math.PI) / 180) * dot.radius
            }px, ${
              Math.sin((dot.angle * Math.PI) / 180) * dot.radius
            }px)`,
            animationDelay: `${dot.delay}s`,
            animationDuration: '3s'
          }}
        />
      ))}
    </>
  );
}

export default  FloatingDots ;