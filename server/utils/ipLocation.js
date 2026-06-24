import fetch from 'node-fetch'; // We might need node-fetch if Node version doesn't support global fetch

export async function getIpLocation(ip) {
  let location = 'Localhost / Không xác định';
  let publicIp = ip;
  
  if (ip === '::1' || ip === '127.0.0.1') {
    publicIp = '127.0.0.1';
  }
  
  try {
    const fetchUrl = (publicIp === '127.0.0.1') ? 'http://ip-api.com/json/' : `http://ip-api.com/json/${publicIp}`;
    const geoRes = await fetch(fetchUrl);
    const geo = await geoRes.json();
    if (geo.status === 'success') {
      location = `${geo.city}, ${geo.regionName}, ${geo.country} (Nhà mạng: ${geo.isp})`;
      if (publicIp === '127.0.0.1') publicIp = geo.query; // Hiển thị IP Public thật thay vì 127.0.0.1
      
      // Lấy địa chỉ đường/phường qua Nominatim OpenStreetMap
      if (geo.lat && geo.lon) {
        try {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${geo.lat}&lon=${geo.lon}`, {
            headers: { 'User-Agent': 'LearnHubApp/1.0' }
          });
          const nomGeo = await nomRes.json();
          if (nomGeo && nomGeo.display_name) {
            location = `${nomGeo.display_name} (Nhà mạng: ${geo.isp})`;
          }
        } catch(err) {
          console.log("Could not reverse geocode");
        }
      }
    }
  } catch (e) {
    console.log("Could not fetch IP location");
  }

  return { ip: publicIp, location };
}
