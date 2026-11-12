// The eight regions of the map. Every source graph belongs to exactly one; test/data.test.js
// fails if a new graph arrives unmapped. Colours come from the xterm-256 terminal palette
// (the colour system developers already read every day), one per region.
export const REGIONS = [
  { id: 'languages', name: 'Languages', ansi: 220, blurb: 'The programming languages themselves: syntax, history, standard libraries and the people behind them.',
    graphs: ['C', 'CPP', 'csharp', 'Python', 'Lua', 'Perl', 'fortran', 'COBOL', 'BASIC', 'Haskell', 'Scala', 'Golang', 'Rust', 'JavaScript', 'grace_hopper'] },
  { id: 'paradigms', name: 'Paradigms & compilers', ansi: 208, blurb: 'How programs are organised and turned into machine code: paradigms, objects, memory, concurrency, compilers and binary interfaces.',
    graphs: ['imperative_programming', 'object_oriented_programming', 'object', 'garbage_collection', 'concurrent_computing', 'gnu_compiler_collection', 'application_binary_interface_abi', 'android_runtime_art'] },
  { id: 'machines', name: 'Machines', ansi: 44, blurb: 'Instruction sets, assembly, x86 and the GPU stack that runs today’s numerical code.',
    graphs: ['x86', 'instruction_set_architecture', 'asm', 'Cuda', 'PyTorch'] },
  { id: 'systems', name: 'Systems', ansi: 69, blurb: 'Operating systems, virtual machines, containers and their orchestration, disk and system images, sandboxes and version control.',
    graphs: ['OS', 'virtual_machine', 'Containerization', 'Docker', 'Kubernetes', 'system_image', 'optical_disc_image', 'volume_computing', 'sandbox', 'git'] },
  { id: 'networks', name: 'Networks', ansi: 77, blurb: 'Packets, switches, routers and routing, IP, TCP, HTTP and the OSI model, Wi-Fi, CAN, packet analysers, firewalls and nginx.',
    graphs: ['Network_Packet', 'Network_Switch', 'Router_Graph', 'Routing', 'IPv6', 'Internet_Protocol', 'TCP_IP', 'OSI-Model', 'HTTP_regenerated', 'wifi_graph', 'CAN', 'Packet_Analyzer', 'Firewall', 'nginx'] },
  { id: 'web', name: 'Web & cloud', ansi: 170, blurb: 'APIs, web frameworks, React, Next.js, CSS, Rails, the Web itself, search engines and cloud computing.',
    graphs: ['API', 'Web_Framework', 'React_Graph', 'React_Native', 'Next.js', 'CSS', 'Ruby_on_Rails', 'world_wide_web', 'search_engine', 'vertical_search_engine', 'Cloud_Computing'] },
  { id: 'security', name: 'Security & crypto', ansi: 203, blurb: 'Public-key cryptography, signatures and hashes, proof of work and Bitcoin, botnets, Mirai and denial-of-service attacks.',
    graphs: ['public_key_cryptography', 'digital_signature', 'cryptographichash', 'dsa', 'proof_of_work', 'bitcoin', 'botnets', 'mirai', 'gayfemboy', 'denial_of_service'] },
  { id: 'p2p', name: 'Peer-to-peer & hidden web', ansi: 147, blurb: 'BitTorrent and torrent files, distributed hash tables, overlay networks, Tor and the deep web.',
    graphs: ['bittorrent', 'torrentfile', 'DHT', 'overlay_networks', 'tor', 'clearnet', 'deep_web'] },
];

export const REGION_BY_ID = Object.fromEntries(REGIONS.map(r => [r.id, r]));
const GRAPH_TO_REGION = new Map(REGIONS.flatMap(r => r.graphs.map(g => [g, r.id])));
export function regionOfGraph(graphId) {
  return GRAPH_TO_REGION.get(graphId) || null;
}
