"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WeatherLookupForm() {
  const [weatherId, setWeatherId] = useState("");
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await fetch(
        `http://localhost:8000/weather/${weatherId}`
      );
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to retrieve weather data.");
      }
    } catch (err) {
      setError("Network error: Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Lookup Weather Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter weather request ID"
            value={weatherId}
            onChange={(e) => setWeatherId(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Loading..." : "Get Weather Data"}
          </Button>

          {error && (
            <div className="p-3 mt-4 text-sm text-red-500 bg-red-900/20 border border-red-500 rounded">
              {error}
            </div>
          )}

          {weatherData && (
            <div className="mt-6 w-full border border-border rounded p-6 space-y-6 bg-muted/10">
              <div>
                <h3 className="text-md font-semibold mb-2">
                  Location Information
                </h3>
                <table className="w-full text-sm border-separate border-spacing-y-1">
                  <tbody>
                    <tr>
                      <td className="font-medium">Name:</td>
                      <td>{weatherData.location.name}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Region:</td>
                      <td>{weatherData.location.region}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Country:</td>
                      <td>{weatherData.location.country}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Latitude:</td>
                      <td>{weatherData.location.lat}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Longitude:</td>
                      <td>{weatherData.location.lon}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Timezone:</td>
                      <td>{weatherData.location.timezone_id}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Local Time:</td>
                      <td>{weatherData.location.localtime}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-3">
                  Weather Conditions
                </h3>
                <div className="flex items-center gap-4 mb-4 p-2 rounded border bg-background">
                  <img
                    src={weatherData.weather.weather_icons?.[0]}
                    alt="Weather Icon"
                    className="w-16 h-16 rounded shadow"
                  />
                  <p className="text-lg font-semibold">
                    {weatherData.weather.weather_descriptions?.[0] ||
                      "Unknown Weather"}
                  </p>
                </div>
                <table className="w-full text-sm border-separate border-spacing-y-1">
                  <tbody>
                    <tr>
                      <td className="font-medium">Temperature:</td>
                      <td>{weatherData.weather.temperature}&deg;C</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Feels Like:</td>
                      <td>{weatherData.weather.feelslike}&deg;C</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Humidity:</td>
                      <td>{weatherData.weather.humidity}%</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Wind:</td>
                      <td>
                        {weatherData.weather.wind_speed} km/h{" "}
                        {weatherData.weather.wind_dir}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-medium">Pressure:</td>
                      <td>{weatherData.weather.pressure} mb</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Visibility:</td>
                      <td>{weatherData.weather.visibility} km</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Cloud Cover:</td>
                      <td>{weatherData.weather.cloudcover}%</td>
                    </tr>
                    <tr>
                      <td className="font-medium">UV Index:</td>
                      <td>{weatherData.weather.uv_index}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-md font-semibold mb-2">
                  Astronomical Data
                </h3>
                <table className="w-full text-sm border-separate border-spacing-y-1">
                  <tbody>
                    <tr>
                      <td className="font-medium">Sunrise:</td>
                      <td>{weatherData.weather.astro?.sunrise}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Sunset:</td>
                      <td>{weatherData.weather.astro?.sunset}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Moonrise:</td>
                      <td>{weatherData.weather.astro?.moonrise}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Moonset:</td>
                      <td>{weatherData.weather.astro?.moonset}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Moon Phase:</td>
                      <td>{weatherData.weather.astro?.moon_phase}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Moon Illumination:</td>
                      <td>{weatherData.weather.astro?.moon_illumination}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-sm mt-2">
                <p>
                  <strong>Notes:</strong> {weatherData.notes || "None"}
                </p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
