(function () {
  const mapKey = window.DeveloperMapKey;

  function mount(canvas, tooltip, atlas, onSelect) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable in this browser");
    const nodes = atlas.nodes;
    const edges = atlas.edges;
    const styles = new Map(edges.map((edge) => [edge, mapKey.classify(edge)]));
    const ranked = [...nodes].sort((left, right) => right.degree - left.degree);
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const neighbors = new Map(nodes.map((node) => [node.id, new Set()]));
    for (const edge of edges) {
      neighbors.get(edge.source)?.add(edge.target);
      neighbors.get(edge.target)?.add(edge.source);
    }
    const bounds = nodes.reduce(
      (result, node) => ({
        minX: Math.min(result.minX, node.layout.x),
        maxX: Math.max(result.maxX, node.layout.x),
        minY: Math.min(result.minY, node.layout.y),
        maxY: Math.max(result.maxY, node.layout.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
    );
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    let width = 960;
    let height = 620;
    let fitScaleX = 1;
    let fitScaleY = 1;
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let selected = null;
    let hovered = null;
    let topic = "all";
    let focusedEdges = [];
    let featuredEdge = null;
    let edgeOnly = false;
    let renderedIncidentIds = [];
    let edgeGeometry = new Map();
    const parallel = new Map();
    const lanes = new Map();
    for (const edge of edges) { const key = [edge.source, edge.target].sort().join("|"); if (!parallel.has(key)) parallel.set(key, []); parallel.get(key).push(edge); }
    for (const group of parallel.values()) group.forEach((edge, index) => lanes.set(edge.id, { index, total: group.length }));
    let drag = null;
    let scheduled = false;

    function screen(node) {
      return {
        x: width / 2 + panX + (node.layout.x - centerX) * fitScaleX * zoom,
        y: height / 2 + panY + (node.layout.y - centerY) * fitScaleY * zoom,
      };
    }

    function draw() {
      scheduled = false;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const active = selected || hovered;
      renderedIncidentIds = [];
      edgeGeometry = new Map();
      const incident = active ? edges.filter(edge => edge.source === active || edge.target === active) : [];
      const related = active ? neighbors.get(active) || new Set() : null;
      function drawEdge(edge, highlighted) {
        const from = byId.get(edge.source),
          to = byId.get(edge.target);
        if (!from || !to) return;
        const inTopic =
          topic === "all" ||
          from.topics.includes(topic) ||
          to.topics.includes(topic);
        const style = styles.get(edge);
        context.globalAlpha =
          edge === featuredEdge && edgeOnly
            ? 1
            : highlighted
                ? 0.72
                : active
                  ? 0.065
                  : inTopic
                    ? 0.21
                    : 0.05;
        context.strokeStyle = style.color;
        context.lineWidth = edge === featuredEdge && edgeOnly ? 4 : highlighted ? 2.2 : 0.8;
        context.setLineDash(style.dash);
        const sourcePoint = screen(from),
          targetPoint = screen(to);
        const distance = Math.hypot(
          targetPoint.x - sourcePoint.x,
          targetPoint.y - sourcePoint.y,
        );
        const alongX = distance
          ? (targetPoint.x - sourcePoint.x) / distance
          : 0;
        const alongY = distance
          ? (targetPoint.y - sourcePoint.y) / distance
          : 0;
        const featured = edge === featuredEdge && distance > 32;
        const start = featured
          ? { x: sourcePoint.x + alongX * 12, y: sourcePoint.y + alongY * 12 }
          : sourcePoint;
        const end = featured
          ? { x: targetPoint.x - alongX * 14, y: targetPoint.y - alongY * 14 }
          : targetPoint;
        const lane = lanes.get(edge.id);
        const offset = lane.total > 1 ? (lane.index - (lane.total - 1) / 2) * 18 : 0;
        const direction = edge.source < edge.target ? 1 : -1;
        const control = { x: (start.x + end.x) / 2 - alongY * offset * direction, y: (start.y + end.y) / 2 + alongX * offset * direction };
        context.beginPath();
        if (edge.source === edge.target) {
          const radius = 16 + lane.index * 7;
          context.arc(start.x, start.y - radius, radius, 0.2, Math.PI * 2 + 0.2);
          context.stroke();
          if (highlighted) { context.fillStyle = style.color; context.fillText('↻ ' + edge.relation, start.x + radius + 4, start.y - radius); }
        } else {
          context.moveTo(start.x, start.y);
          context.quadraticCurveTo(control.x, control.y, end.x, end.y);
          context.stroke();
          if (highlighted && offset) { context.fillStyle = style.color; context.font = '10px ui-monospace, monospace'; context.fillText(String(lane.index + 1), control.x, control.y); }
        }
        if (highlighted) { renderedIncidentIds.push(edge.id); edgeGeometry.set(edge.id, { start, end, control, loop: edge.source === edge.target, radius: 16 + lane.index * 7 }); }
        if (
          (style.arrow || highlighted) &&
          (highlighted || (style.id === "orchestration" && !active && inTopic))
        ) {
          if (distance > 15) {
            const t = 0.82, u = 1 - t;
            const tipX = u*u*start.x + 2*u*t*control.x + t*t*end.x, tipY = u*u*start.y + 2*u*t*control.y + t*t*end.y;
            const tangentX = 2*u*(control.x-start.x)+2*t*(end.x-control.x), tangentY = 2*u*(control.y-start.y)+2*t*(end.y-control.y);
            const tangentLength = Math.max(1, Math.hypot(tangentX,tangentY));
            const alongX = tangentX/tangentLength, alongY = tangentY/tangentLength;
            const baseX = tipX - alongX * (featured ? 11 : 6),
              baseY = tipY - alongY * (featured ? 11 : 6);
            const halfWidth = featured ? 6 : 3;
            context.beginPath();
            if (style.arrow === "filled") {
              context.moveTo(tipX, tipY);
              context.lineTo(
                baseX - alongY * halfWidth,
                baseY + alongX * halfWidth,
              );
              context.lineTo(
                baseX + alongY * halfWidth,
                baseY - alongX * halfWidth,
              );
              context.fillStyle = style.color;
              context.fill();
            } else {
              context.moveTo(
                baseX - alongY * halfWidth,
                baseY + alongX * halfWidth,
              );
              context.lineTo(tipX, tipY);
              context.lineTo(
                baseX + alongY * halfWidth,
                baseY - alongX * halfWidth,
              );
              context.setLineDash([]);
              context.stroke();
            }
          }
        }
      }
      for (const edge of edges)
        if (!active || (edge.source !== active && edge.target !== active))
          drawEdge(edge, false);
      if (active)
        for (const edge of incident)
          if (edge !== featuredEdge) drawEdge(edge, true);
      if (featuredEdge && incident.includes(featuredEdge)) drawEdge(featuredEdge, true);
      context.setLineDash([]);
      const labeled = new Set(ranked.slice(0, 32).map((node) => node.id));
      if (active) {
        labeled.add(active);
        for (const node of ranked.filter((node) => related.has(node.id)))
          labeled.add(node.id);
      }
      if (featuredEdge) {
        labeled.add(featuredEdge.source);
        labeled.add(featuredEdge.target);
      }
      for (const node of nodes) {
        const point = screen(node);
        const relevant = node.id === active || related?.has(node.id);
        const inTopic = topic === "all" || node.topics.includes(topic);
        const radius = Math.max(
          1.5,
          Math.min(
            8,
            (3 + Math.sqrt(node.degree || 0) * 0.65) *
              Math.max(
                0.58,
                Math.min(1.6, Math.min(fitScaleX, fitScaleY) * zoom),
              ),
          ),
        );
        const featured =
          featuredEdge &&
          (featuredEdge.source === node.id || featuredEdge.target === node.id);
        context.globalAlpha =
          active
              ? relevant
                ? 1
                : 0.3
              : inTopic
                ? 0.82
                : 0.25;
        context.fillStyle = mapKey.domainById.get(mapKey.groupOf(node)).color;
        context.beginPath();
        context.arc(
          point.x,
          point.y,
          featured || node.id === active ? radius + 3 : radius,
          0,
          Math.PI * 2,
        );
        context.fill();
        if (node.id === active || featured) {
          context.strokeStyle = "#f5fff9";
          context.lineWidth = 2;
          context.stroke();
        }
      }
      const labelBoxes = [];
      const labelOrder = [...nodes].sort((a, b) => {
        const rank = (node) =>
          node.id === active
            ? 0
            : featuredEdge &&
                [featuredEdge.source, featuredEdge.target].includes(node.id)
              ? 1
              : mapKey.groupOf(node) === "source"
                ? 3
                : 2;
        return rank(a) - rank(b) || b.degree - a.degree;
      });
      for (const node of labelOrder) {
        if (
          !labeled.has(node.id) ||
          (topic !== "all" &&
            !node.topics.includes(topic) &&
            node.id !== active && !related?.has(node.id))
        )
          continue;
        if (active && node.id !== active && !related.has(node.id)) continue;
        const point = screen(node);
        if (
          point.x < 8 ||
          point.y < 18 ||
          point.x > width - 8 ||
          point.y > height - 25
        )
          continue;
        const important =
          node.id === active || related?.has(node.id) ||
          (featuredEdge &&
            [featuredEdge.source, featuredEdge.target].includes(node.id));
        context.font =
          (important ? "600 13px" : "11px") + " ui-monospace, monospace";
        const label =
          node.label.length > 28 ? node.label.slice(0, 27) + "…" : node.label;
        const tw = context.measureText(label).width;
        const x = Math.max(8, Math.min(width - tw - 12, point.x + 10));
        const y = point.y + (important ? 25 : -9);
        const box = { x: x - 3, y: y - 13, w: tw + 9, h: 19 };
        if (
          !important &&
          labelBoxes.some(
            (b) =>
              box.x < b.x + b.w &&
              box.x + box.w > b.x &&
              box.y < b.y + b.h &&
              box.y + box.h > b.y,
          )
        )
          continue;
        labelBoxes.push(box);
        context.globalAlpha = 0.93;
        context.fillStyle = "#111810";
        context.fillRect(box.x, box.y, box.w, box.h);
        context.globalAlpha = 1;
        context.fillStyle = important ? "#edffd8" : "#b8c8b0";
        context.fillText(label, x, y);
      }
      if (featuredEdge) {
        const from = screen(byId.get(featuredEdge.source)),
          to = screen(byId.get(featuredEdge.target));
        const dx = to.x - from.x,
          dy = to.y - from.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const style = styles.get(featuredEdge);
        const relation = style.label.replace(/\s*→$/, "").toUpperCase();
        const formula = String(
          featuredEdge.record?.mathematical_form ||
            featuredEdge.relation.replaceAll("_", " "),
        );
        const caption = `${relation} · ${formula.length > 32 ? `${formula.slice(0, 31)}…` : formula}`;
        context.font = "600 12px system-ui, sans-serif";
        const textWidth = Math.min(
          width - 20,
          Math.ceil(
            (context.measureText?.(caption).width || caption.length * 7) + 20,
          ),
        );
        const labelX = Math.max(
          10,
          Math.min(
            width - textWidth - 10,
            (from.x + to.x) / 2 - textWidth / 2 - (dy / distance) * 24,
          ),
        );
        const labelY = Math.max(
          22,
          Math.min(height - 12, (from.y + to.y) / 2 + (dx / distance) * 24),
        );
        context.globalAlpha = 1;
        context.fillStyle = "#1b2718";
        context.fillRect(labelX, labelY - 18, textWidth, 25);
        context.fillStyle = style.color;
        context.fillText(caption, labelX + 9, labelY);
      }
      context.globalAlpha = 1;
      canvas.dataset.incidentEdgeIds = JSON.stringify(renderedIncidentIds);
      canvas.dataset.selectedConcept = selected || "";
      canvas.dataset.neighborhoodScope = selected ? "all sources; incoming and outgoing; no edge cap" : "overview";
    }

    function requestDraw() {
      if (scheduled) return;
      scheduled = true;
      (
        window.requestAnimationFrame || ((callback) => setTimeout(callback, 16))
      )(draw);
    }

    function frameNeighborhood() {
      const active = selected; if (!active) return;
      const points = [byId.get(active), ...[...(neighbors.get(active) || [])].map(id => byId.get(id))];
      const xs = points.map(n => (n.layout.x - centerX) * fitScaleX), ys = points.map(n => (n.layout.y - centerY) * fitScaleY);
      const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
      zoom = Math.min(6, (width - 100) / Math.max(50, right - left), (height - 110) / Math.max(50, bottom - top));
      panX = -(left + right) / 2 * zoom; panY = -(top + bottom) / 2 * zoom;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, Math.round(rect.width || 960));
      height = Math.max(340, Math.round(rect.height || 620));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      fitScaleX = (width - 36) / Math.max(1, bounds.maxX - bounds.minX);
      fitScaleY = (height - 36) / Math.max(1, bounds.maxY - bounds.minY);
      frameNeighborhood();
      draw();
    }

    function hitTest(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left,
        y = clientY - rect.top;
      let closest = null,
        distance = 12;
      for (const node of nodes) {
        const point = screen(node);
        const candidate = Math.hypot(point.x - x, point.y - y);
        if (candidate < distance) {
          distance = candidate;
          closest = node;
        }
      }
      return closest;
    }

    function edgeAt(clientX, clientY) {
      if (!selected) return null;
      const rect = canvas.getBoundingClientRect();
      const pointX = clientX - rect.left,
        pointY = clientY - rect.top;
      let closest = null,
        distance = 7;
      for (const edge of focusedEdges) {
        const geometry = edgeGeometry.get(edge.id); if (!geometry) continue;
        const { start, end, control, loop, radius } = geometry;
        let separation = Infinity;
        if (loop) separation = Math.abs(Math.hypot(pointX - start.x, pointY - (start.y - radius)) - radius);
        else for (let step = 0; step <= 30; step++) {
          const t=step/30, u=1-t;
          separation = Math.min(separation, Math.hypot(pointX-(u*u*start.x+2*u*t*control.x+t*t*end.x), pointY-(u*u*start.y+2*u*t*control.y+t*t*end.y)));
        }
        if (separation < distance) {
          distance = separation;
          closest = edge;
        }
      }
      return closest;
    }

    function moveTooltip(event, node, edge) {
      tooltip.hidden = !node && !edge;
      if (!node && !edge) return;
      tooltip.textContent = node
        ? `${node.label} · ${edges.filter(edge => edge.source === node.id || edge.target === node.id).length} incident links`
        : `${byId.get(edge.source).label} → ${byId.get(edge.target).label} · ${edge.relation.replaceAll("_", " ")}${edge.semantic ? ` · ${edge.semantic}` : ""}${edge.record?.mathematical_form ? ` · ${edge.record.mathematical_form}` : ""}${edge.record?.conditions ? ` · When: ${Array.isArray(edge.record.conditions) ? edge.record.conditions.join("; ") : edge.record.conditions}` : ""}`;
      const bounds = canvas.getBoundingClientRect();
      tooltip.style.left = `${Math.min(bounds.width - 190, Math.max(10, event.clientX - bounds.left + 12))}px`;
      tooltip.style.top = `${Math.max(10, event.clientY - bounds.top - 32)}px`;
    }

    canvas.addEventListener("pointerdown", (event) => {
      drag = { x: event.clientX, y: event.clientY, panX, panY, moved: false };
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (drag) {
        const dx = event.clientX - drag.x,
          dy = event.clientY - drag.y;
        if (Math.hypot(dx, dy) > 4) drag.moved = true;
        if (drag.moved) {
          panX = drag.panX + dx;
          panY = drag.panY + dy;
          tooltip.hidden = true;
          requestDraw();
          return;
        }
      }
      const node = hitTest(event.clientX, event.clientY);
      const edge = node ? null : edgeAt(event.clientX, event.clientY);
      if (hovered !== node?.id) {
        hovered = node?.id || null;
        requestDraw();
      }
      canvas.style.cursor = node
        ? "pointer"
        : edge
          ? "help"
          : drag
            ? "grabbing"
            : "grab";
      moveTooltip(event, node, edge);
    });
    canvas.addEventListener("pointerup", (event) => {
      if (drag && !drag.moved) {
        const node = hitTest(event.clientX, event.clientY);
        if (node) onSelect(node.id);
        else { const edge = edgeAt(event.clientX, event.clientY); if (edge) { featuredEdge = edge; edgeOnly = true; draw(); canvas.dispatchEvent(new CustomEvent("edgeinspect", { detail: { id: edge.id } })); } }
      }
      drag = null;
    });
    canvas.addEventListener("pointercancel", () => {
      drag = null;
    });
    canvas.addEventListener("pointerleave", () => {
      hovered = null;
      tooltip.hidden = true;
      requestDraw();
    });
    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
        const next = Math.max(0.65, Math.min(12, zoom * factor));
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - width / 2,
          y = event.clientY - rect.top - height / 2;
        panX = x - (x - panX) * (next / zoom);
        panY = y - (y - panY) * (next / zoom);
        zoom = next;
        requestDraw();
      },
      { passive: false },
    );
    window.addEventListener("resize", resize);
    resize();

    return {
      select(id) {
        featuredEdge = null;
        edgeOnly = false;
        selected = id;
        focusedEdges = id
          ? edges.filter((edge) => edge.source === id || edge.target === id)
          : [];
        hovered = null;
        tooltip.hidden = true;
        frameNeighborhood();
        draw();
      },
      focusEdge(edge) {
        featuredEdge = edge;
        frameNeighborhood();
        draw();
      },
      edgeFocus(value) {
        edgeOnly = value;
        frameNeighborhood();
        draw();
      },
      topic(id) {
        topic = id;
        draw();
      },
      zoom(factor) {
        zoom = Math.max(0.65, Math.min(12, zoom * factor));
        draw();
      },
      fit() {
        zoom = 1;
        panX = 0;
        panY = 0;
        selected = null;
        featuredEdge = null;
        focusedEdges = [];
        draw();
      },
      highlight(id) { hovered = id; draw(); },
      counts() {
        return {
          incidentEdgeIds: [...renderedIncidentIds],
          incidentEdges: focusedEdges.length,
          nodes: nodes.length,
          edges: edges.length,
          connected: selected ? neighbors.get(selected)?.size || 0 : 0,
        };
      },
    };
  }

  window.DeveloperNetwork = { mount };
})();
