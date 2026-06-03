import { ref, onMounted, onUnmounted, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '@/stores/map'
import { useTravelStore } from '@/stores/travel'
import {
  loadGeoJSON,
  extractAdcode,
  extractName,
  extractCenter,
} from '@/composables/useGeoJSON'
import type { AdminLevel } from '@/types'

export function useMap(containerId: string) {
  let map: maplibregl.Map | null = null
  const mapReady = ref(false)
  const mapStore = useMapStore()
  const travelStore = useTravelStore()
  const selectedFeature = ref<GeoJSON.Feature | null>(null)
  const loading = ref(false)

  const LIGHT_STYLE: maplibregl.StyleSpecification = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '',
      },
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  }

  const DARK_STYLE: maplibregl.StyleSpecification = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
        attribution: '',
      },
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  }

  function initMap() {
    map = new maplibregl.Map({
      container: containerId,
      style: mapStore.darkMode ? DARK_STYLE : LIGHT_STYLE,
      center: [104.0, 35.0],
      zoom: 3.5,
      minZoom: 2,
      maxZoom: 12,
      attributionControl: false,
      trackResize: true,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

    map.on('load', async () => {
      mapReady.value = true
      await travelStore.loadPlaces()
      await loadAdminLayer()
    })

    map.on('click', 'admin-fill', (e) => {
      if (e.features && e.features.length > 0) {
        selectedFeature.value = e.features[0] as unknown as GeoJSON.Feature
      }
    })

    map.on('mouseenter', 'admin-fill', () => {
      if (map) map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'admin-fill', () => {
      if (map) map.getCanvas().style.cursor = ''
    })
  }

  function removeAdminLayers() {
    if (!map) return
    const layerIds = ['admin-label', 'admin-line', 'admin-fill']
    for (const id of layerIds) {
      if (map.getLayer(id)) map.removeLayer(id)
    }
    if (map.getSource('admin-source')) {
      map.removeSource('admin-source')
    }
  }

  async function loadAdminLayer() {
    if (!map || !mapReady.value) return

    const level = mapStore.currentLevel
    loading.value = true

    try {
      const geojson = await loadGeoJSON(level)
      const enriched = enrichGeoJSON(geojson, level)

      removeAdminLayers()

      map.addSource('admin-source', {
        type: 'geojson',
        data: enriched,
      })

      map.addLayer({
        id: 'admin-fill',
        type: 'fill',
        source: 'admin-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'placeType'],
            'visited', '#34a853',
            'wishlist', '#fbbc04',
            'rgba(200, 200, 200, 0.15)',
          ],
          'fill-opacity': [
            'match',
            ['get', 'placeType'],
            'visited', 0.45,
            'wishlist', 0.45,
            0.08,
          ],
        },
      })

      map.addLayer({
        id: 'admin-line',
        type: 'line',
        source: 'admin-source',
        paint: {
          'line-color': [
            'match',
            ['get', 'placeType'],
            'visited', '#34a853',
            'wishlist', '#fbbc04',
            mapStore.darkMode ? '#555' : '#999',
          ],
          'line-width': [
            'match',
            ['get', 'placeType'],
            'visited', 2,
            'wishlist', 2,
            0.8,
          ],
          'line-opacity': 0.9,
        },
      })

      map.addLayer({
        id: 'admin-label',
        type: 'symbol',
        source: 'admin-source',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            3, level === 'county' ? 8 : 10,
            6, level === 'county' ? 10 : 12,
            10, 14,
          ],
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          'text-color': mapStore.darkMode ? '#ccc' : '#333',
          'text-halo-color': mapStore.darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
          'text-halo-width': 1.5,
        },
      })
    } catch (err) {
      console.error('Failed to load admin layer:', err)
    } finally {
      loading.value = false
    }
  }

  function enrichGeoJSON(
    geojson: GeoJSON.FeatureCollection,
    level: AdminLevel
  ): GeoJSON.FeatureCollection {
    const features = geojson.features.map(f => {
      const adcode = extractAdcode(f)
      const placeType = travelStore.getAggregatedPlaceType(adcode, level)
      const numId = parseInt(adcode, 10)
      return {
        type: 'Feature' as const,
        id: isNaN(numId) ? undefined : numId,
        properties: {
          name: extractName(f),
          adcode,
          level: f.properties?.level || '',
          placeType,
        },
        geometry: f.geometry,
      }
    })
    return { type: 'FeatureCollection', features }
  }

  async function switchLevel(level: AdminLevel) {
    mapStore.setLevel(level)
    selectedFeature.value = null
    await loadAdminLayer()
  }

  async function refreshLayer() {
    await loadAdminLayer()
  }

  function switchStyle() {
    if (!map) return
    removeAdminLayers()
    map.setStyle(mapStore.darkMode ? DARK_STYLE : LIGHT_STYLE)
    map.once('style.load', () => {
      loadAdminLayer()
    })
  }

  watch(() => mapStore.darkMode, () => {
    switchStyle()
  })

  onMounted(() => {
    initMap()
  })

  onUnmounted(() => {
    if (map) {
      map.remove()
      map = null
    }
  })

  return {
    mapReady,
    selectedFeature,
    loading,
    switchLevel,
    refreshLayer,
    map: () => map,
  }
}
