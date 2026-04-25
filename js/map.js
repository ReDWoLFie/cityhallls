// Map variables
let currentScale = 1;
const scaleStep = 0.1;
const minScale = 1.0;
const maxScale = 3.0;

let isDraggingMap = false;
let dragStartX = 0, dragStartY = 0, scrollStartLeft = 0, scrollStartTop = 0;
let draggedMarker = null;
let draggedMarkerBusinessId = null;
let dragStartMarkerX = 0, dragStartMarkerY = 0;
let originalLeft = 0, originalTop = 0;
let isDraggingMarker = false;
let pickLocationMode = false;
let pendingCoords = null;

// DOM elements for map
let markersLayer = null, mapImage = null, mapImageWrapper = null;
let mapWrapper = null, mapContainer = null;

function updateMapScale() {
    if (mapImageWrapper) {
        mapImageWrapper.style.transform = `scale(${currentScale})`;
        mapImageWrapper.style.transformOrigin = 'top left';
        if (mapContainer) {
            mapContainer.style.width = `${mapImageWrapper.offsetWidth}px`;
            mapContainer.style.height = `${mapImageWrapper.offsetHeight}px`;
        }
    }
    setTimeout(() => updateMapMarkers(), 50);
}

function zoomIn() {
    if (currentScale < maxScale) {
        currentScale += scaleStep;
        updateMapScale();
    }
}

function zoomOut() {
    if (currentScale > minScale) {
        currentScale -= scaleStep;
        updateMapScale();
    }
}

function startDragMap(e) {
    if (pickLocationMode || isDraggingMarker) return;
    if (e.target === mapImageWrapper || mapImageWrapper.contains(e.target)) {
        isDraggingMap = true;
        mapWrapper.classList.add('dragging');
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        scrollStartLeft = mapWrapper.scrollLeft;
        scrollStartTop = mapWrapper.scrollTop;
        e.preventDefault();
    }
}

function onDragMap(e) {
    if (!isDraggingMap) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    mapWrapper.scrollLeft = scrollStartLeft - dx;
    mapWrapper.scrollTop = scrollStartTop - dy;
    setTimeout(() => updateMapMarkers(), 10);
}

function stopDragMap() {
    if (!isDraggingMap) return;
    isDraggingMap = false;
    mapWrapper.classList.remove('dragging');
}

function updateMapMarkers() {
    if (!markersLayer || !mapImage || !mapImageWrapper) return;
    
    const rect = mapImage.getBoundingClientRect();
    const wrapperRect = mapImageWrapper.getBoundingClientRect();
    const scrollLeft = mapWrapper.scrollLeft;
    const scrollTop = mapWrapper.scrollTop;
    const offsetX = rect.left - wrapperRect.left + scrollLeft;
    const offsetY = rect.top - wrapperRect.top + scrollTop;
    
    businessesData.forEach(business => {
        let markerDiv = document.getElementById(`marker_${business.id}`);
        if (business.mapX !== undefined && business.mapY !== undefined && business.mapX !== null && business.mapY !== null) {
            const left = offsetX + (business.mapX / 100) * rect.width;
            const top = offsetY + (business.mapY / 100) * rect.height;
            const iconUrl = MARKER_ICONS[business.type] || MARKER_ICONS["Остальное"];
            
            if (markerDiv && (!isDraggingMarker || draggedMarkerBusinessId !== business.id)) {
                markerDiv.style.left = left + 'px';
                markerDiv.style.top = top + 'px';
                markerDiv.style.backgroundImage = `url('${iconUrl}')`;
            } else if (!markerDiv) {
                markerDiv = document.createElement('div');
                markerDiv.id = `marker_${business.id}`;
                markerDiv.className = 'map-marker';
                markerDiv.style.left = left + 'px';
                markerDiv.style.top = top + 'px';
                markerDiv.style.backgroundImage = `url('${iconUrl}')`;
                markerDiv.style.backgroundSize = 'contain';
                markerDiv.style.backgroundRepeat = 'no-repeat';
                markerDiv.style.backgroundPosition = 'center';
                markerDiv.style.position = 'absolute';
                markerDiv.style.pointerEvents = 'auto';
                markerDiv.style.zIndex = '20';
                
                if (isAdmin) {
                    markerDiv.style.cursor = 'grab';
                    markerDiv.addEventListener('mousedown', (e) => startDragMarker(e, business.id, markerDiv));
                } else {
                    markerDiv.style.cursor = 'pointer';
                }
                
                markerDiv.addEventListener('click', (e) => {
                    if (!isDraggingMarker) {
                        e.stopPropagation();
                        showBusinessInfoModal(business);
                    }
                });
                
                markersLayer.appendChild(markerDiv);
            }
        } else if (markerDiv) {
            markerDiv.remove();
        }
    });
}

function startDragMarker(e, businessId, markerElement) {
    if (!isAdmin || pickLocationMode) return;
    e.stopPropagation();
    isDraggingMarker = true;
    draggedMarker = markerElement;
    draggedMarkerBusinessId = businessId;
    draggedMarker.classList.add('dragging');
    
    const rect = markerElement.getBoundingClientRect();
    dragStartMarkerX = e.clientX;
    dragStartMarkerY = e.clientY;
    originalLeft = parseFloat(markerElement.style.left);
    originalTop = parseFloat(markerElement.style.top);
    
    document.addEventListener('mousemove', onDragMarker);
    document.addEventListener('mouseup', stopDragMarker);
    e.preventDefault();
}

function onDragMarker(e) {
    if (!isDraggingMarker || !draggedMarker) return;
    
    const dx = e.clientX - dragStartMarkerX;
    const dy = e.clientY - dragStartMarkerY;
    let newLeft = originalLeft + dx;
    let newTop = originalTop + dy;
    draggedMarker.style.left = newLeft + 'px';
    draggedMarker.style.top = newTop + 'px';
    
    const imgRect = mapImage.getBoundingClientRect();
    const wrapperRect = mapImageWrapper.getBoundingClientRect();
    const scrollLeft = mapWrapper.scrollLeft;
    const scrollTop = mapWrapper.scrollTop;
    const offsetX = imgRect.left - wrapperRect.left + scrollLeft;
    const offsetY = imgRect.top - wrapperRect.top + scrollTop;
    const imgX = newLeft - offsetX;
    const imgY = newTop - offsetY;
    let percentX = (imgX / imgRect.width) * 100;
    let percentY = (imgY / imgRect.height) * 100;
    
    if (percentX >= 0 && percentX <= 100 && percentY >= 0 && percentY <= 100) {
        draggedMarker.dataset.newX = Math.min(100, Math.max(0, percentX));
        draggedMarker.dataset.newY = Math.min(100, Math.max(0, percentY));
    }
}

async function stopDragMarker() {
    if (!isDraggingMarker || !draggedMarker) return;
    
    if (draggedMarker.dataset.newX !== undefined && draggedMarker.dataset.newY !== undefined) {
        const newX = parseFloat(draggedMarker.dataset.newX);
        const newY = parseFloat(draggedMarker.dataset.newY);
        await db.collection('businesses').doc(draggedMarkerBusinessId).update({
            mapX: newX,
            mapY: newY
        });
        showToast(`📍 Маркер "${businessesData.find(b => b.id === draggedMarkerBusinessId)?.name}" перемещён`);
        delete draggedMarker.dataset.newX;
        delete draggedMarker.dataset.newY;
    }
    
    draggedMarker.classList.remove('dragging');
    draggedMarker = null;
    draggedMarkerBusinessId = null;
    isDraggingMarker = false;
    
    document.removeEventListener('mousemove', onDragMarker);
    document.removeEventListener('mouseup', stopDragMarker);
    loadAllData();
}

function getClickCoordinates(e) {
    const imgRect = mapImage.getBoundingClientRect();
    const wrapperRect = mapImageWrapper.getBoundingClientRect();
    const scrollLeft = mapWrapper.scrollLeft;
    const scrollTop = mapWrapper.scrollTop;
    const clickX = e.clientX - wrapperRect.left + scrollLeft;
    const clickY = e.clientY - wrapperRect.top + scrollTop;
    const offsetX = imgRect.left - wrapperRect.left + scrollLeft;
    const offsetY = imgRect.top - wrapperRect.top + scrollTop;
    const imgX = clickX - offsetX;
    const imgY = clickY - offsetY;
    let percentX = (imgX / imgRect.width) * 100;
    let percentY = (imgY / imgRect.height) * 100;
    return { x: Math.max(0, Math.min(100, percentX)), y: Math.max(0, Math.min(100, percentY)) };
}

function enablePickLocationMode() {
    if (!isAdmin) return;
    pickLocationMode = true;
    mapImage.style.cursor = 'crosshair';
    const btn = document.getElementById('pickLocationBtn');
    btn.classList.add('active');
    showToast('📍 Режим привязки бизнеса активирован. Кликните по карте для выбора места.');
}

function disablePickLocationMode() {
    pickLocationMode = false;
    mapImage.style.cursor = 'crosshair';
    const btn = document.getElementById('pickLocationBtn');
    if (btn) btn.classList.remove('active');
}

function setupMapClicks() {
    if (!mapImage) return;
    mapImage.addEventListener('click', async (e) => {
        if (!isAdmin) return;
        if (pickLocationMode) {
            const coords = getClickCoordinates(e);
            disablePickLocationMode();
            showBusinessSelectModal(coords);
        }
    });
}

function setupMapWheelZoom() {
    if (!mapWrapper) return;
    mapWrapper.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
    }, { passive: false });
}

function setupMapDrag() {
    if (!mapWrapper) return;
    mapWrapper.addEventListener('mousedown', startDragMap);
    window.addEventListener('mousemove', onDragMap);
    window.addEventListener('mouseup', stopDragMap);
}

function initMap() {
    markersLayer = document.getElementById('markersLayer');
    mapImage = document.getElementById('gtaMapImage');
    mapImageWrapper = document.getElementById('mapImageWrapper');
    mapWrapper = document.getElementById('mapWrapper');
    mapContainer = document.getElementById('mapContainer');
    
    if (!markersLayer || !mapImage || !mapImageWrapper || !mapWrapper) return;
    
    mapImage.addEventListener('load', () => {
        updateMapScale();
        updateMapMarkers();
    });
    
    document.getElementById('zoomInBtn')?.addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn')?.addEventListener('click', zoomOut);
    setupMapWheelZoom();
    setupMapDrag();
    updateMapScale();
    updateMapMarkers();
}

function refreshMap() {
    setTimeout(() => updateMapMarkers(), 100);
}