# Source integration audit — 2026-10-09

Baseline: 3dec97f1cf764ddd3ea12672978f889d2b29feda (live main at task start). All source bytes remain unchanged. Generated atlas.json and overview.json and the non-JSON placeholder are excluded from source discovery. No malformed source was omitted.

## Totals

37 source graphs; 7,812 source node records; 526 source claim records (some reference existing nodes); 8,604 structured source relationships; 522 learning paths. 7,908 canonical records, 16 editorial edges (10 new), 1,529 overview concepts and 2,928 overview links. All 37 documents have concepts in the visible overview.

1,754 connected components and 1,604 isolated archived records are honestly retained. 73 unresolved learning-path segments remain in place. No edge is inferred from path order. Six original self-loops are retained; no merge-created loops or dangling endpoints. Duplicate IDs are checked.

## Complete source coverage

| Source file | Nodes | Relationships | Paths | SHA-256 |
|---|---:|---:|---:|---|
| CSS.json | 135 | 117 | 16 | 8deec230052ef6050d0da59871fd1fe00ca0c87952549c6f13983e56659c4aa1 |
| Cloud_Computing.json | 212 | 214 | 12 | e1dca7ec9a49614960a730ce6c6e1988652b018ae3271a889230e158371dc192 |
| HTTP_regenerated.json | 183 | 251 | 18 | adb76aa09928152d18d46306dd32e186d965c15170d1921ecfd771e2d3a346a6 |
| IPv6.json | 337 | 380 | 12 | cba492e014ccbded312bbb6ccb15d583b99bbe15f1cdb270037f765586fa29b1 |
| Internet_Protocol.json | 247 | 252 | 21 | 75b411ba0896d11e4431e33a24cdf9fdd66857c6d78e116dbcc9c5efc99c821c |
| JavaScript.json | 158 | 204 | 16 | 510de4f2cbc18222f07a247bb564624f9332fead9f4af5eb189bd5539ffa0e3e |
| Lua.json | 364 | 513 | 18 | 93cf5bf13a4bedf38d9ff438cba188834b8e07643b5ad161726e41bfc7a52e68 |
| Network_Packet_Semantic_Knowledge_Graph.json | 263 | 452 | 14 | 2da768522d13b14f4bd14a6721caa20800ff7a3a08eba9d3e28e83892cff650a |
| Network_Switch.json | 232 | 177 | 21 | ea945d25cafc64d3bf2a1965ecf83d98f36bb7953d9926902e85fdb21ad0f74e |
| Next.js.json | 276 | 284 | 0 | a145f339141ada6d184b6003f00e5ce3dac0cda09eb9c827f2bd2b9316e3a182 |
| Packet_Analyzer_Knowledge_Graph.json | 300 | 473 | 15 | 2de8a294df00cb7621ca9f0eaf5567a8fb3613f5edc71eddcf7dd0e2b66dd5ae |
| React_Graph.json | 285 | 261 | 18 | a40db572fdc987d319b7821983e1fae721cfb09edae28c1bb937a5c5c7f57819 |
| React_Native.json | 194 | 195 | 18 | 6939426a53d9f4b410949fc9406a5b4b08a342c83967671f309916d02795b99c |
| Router_Graph.json | 163 | 144 | 21 | 2a15d42d231f934600f4911cecbe9b728e00722ac40b600064f2f45d176c566d |
| Routing.json | 157 | 135 | 18 | 20c202e9de20d4a513acc01e57236c2d9d4a133fe7539ba607ddeb18742383a7 |
| TCP_IP_full_semantic_knowledge_graph.json | 132 | 144 | 12 | eed89c2bf275eb000422b68e4c97ee894533544f31f482817c6eb9f352febe90 |
| Web_Framework.json | 205 | 190 | 18 | 482c9e3915979660779134f49c955d4e6993036e666567b062e53d8aeb891eb6 |
| c_language_full_relationship_rich_semantic_knowledge_graph_v1.json | 315 | 301 | 17 | 4e3e3d2c6444b0cf4ffd423bd30be064bffd911743d79e598ac21838218d4fc8 |
| campus_area_network_full_relationship_rich_semantic_knowledge_graph_v1.json | 75 | 92 | 12 | 5a609c7e517187e2a352f0dbd3c38a24fbf4a4e61c1b75252b76c3cb4e36eb47 |
| containerization_full_relationship_rich_semantic_knowledge_graph_v1.json | 158 | 139 | 14 | 0e33f282999ba981ffdda79f5df09dc0e1a1a5b04a4f2100a0689a81b74978cf |
| cpp_programming_language_full_relationship_rich_semantic_knowledge_graph_v1.json | 144 | 166 | 12 | 21f640d9b2f9dc45671cc07d32704647877b28e65c8af8e2449d09f739fbdce5 |
| cuda_full_relationship_rich_semantic_knowledge_graph_v1_regenerated.json | 145 | 137 | 12 | d6d3bfbfc336e7e328300a4576a65f078c1f297022ff9dfa119b6312fcd24b0d |
| docker_full_relationship_rich_semantic_knowledge_graph_v1.json | 230 | 194 | 12 | be82c8488a0e7511e0ce9fb56b799c1e631763effd38ec3616bcc29719338672 |
| firewall_full_relationship_rich_semantic_knowledge_graph_v1.json | 195 | 163 | 12 | a50c9fadaae398902658eacb2305634444b02ccd36b20250e7b3f46122ee795d |
| go_programming_language_full_relationship_rich_semantic_knowledge_graph_v1.json | 168 | 155 | 12 | 67b6aaed94bed1f0a7a6cd331e78437fd7c5f5758ef860142fd4832ac7080d9c |
| kubernetes_full_relationship_rich_semantic_knowledge_graph_v2_verified.json | 173 | 154 | 12 | e7275d7ed5309502d09120b9838b2021353b492dacdd397e0df85984b5c717ff |
| operating_system_full_relationship_rich_semantic_knowledge_graph_v2.json | 388 | 389 | 18 | 7977863e4d7c3e5b5ca1c9725a63893199c254280cb4652f2bfb3c93a736d5dc |
| optical_disc_image_full_relationship_rich_semantic_knowledge_graph_v1.json | 206 | 227 | 11 | 17af3759f04dd72ff116e1336b72d83d5a8cd060c6edccf963985c5f29c0816a |
| osi_model_full_layered_dynamic_semantic_knowledge_graph_v1.json | 206 | 240 | 12 | 7911fe5922c40b8e32ba2d8098bc44b6988a875fc5accf8927b901c6cfba55ef |
| python_language_full_relationship_rich_semantic_knowledge_graph_v2.json | 428 | 576 | 18 | 9e837cc826e63f04fcf26facc90af0db9649b5a02c72b06bb8c312bed6781e4a |
| pytorch_full_relationship_rich_semantic_knowledge_graph_v2.json | 138 | 150 | 12 | 94395edc7de56991f55cbc84e1aa817209b4bd05258e806b816c1e657d350073 |
| ruby_on_rails_full_relationship_rich_semantic_knowledge_graph_v1.json | 181 | 291 | 12 | 2dbe795ef2d31ff45b1d784c06af35c9fd925ce67564a9a4c0b2cc32a8da43a4 |
| sandbox_computer_security_full_relationship_rich_semantic_knowledge_graph_v1.json | 205 | 170 | 14 | 7d260c895ed40b3a139866388e9bb3e879bc770fc0f6d74541d32c9aba26b5a0 |
| system_image_full_relationship_rich_semantic_knowledge_graph_v1.json | 140 | 132 | 10 | 516796a296b538588f83f0b5de3109df7bc50f4862f4b3b79d826f92886e44d5 |
| virtual_machine_full_relationship_rich_semantic_knowledge_graph_v1.json | 210 | 151 | 12 | ddb2ebaaf4b9b6e97d5d01959066ca3c187ee33d5d132b710076d1d7840d98b5 |
| volume_computing_full_relationship_rich_semantic_knowledge_graph_v3.json | 179 | 285 | 12 | ca6a984d0b000eb4ad957dbfcf9552598a47bf38cc45b3b837abf334c7f3b063 |
| wifi_graph.json | 85 | 106 | 8 | 76c5ddc8316eebcd9e68ffd831d8598c69c93fd5c70066c3abd569b450733dce |

## Identity and provenance

Frozen baseline identity assignments prevent a new upload from re-keying old concepts. New records default to source-qualified IDs, even when their labels match. Explicitly reviewed groups unify named protocols, technologies and languages. Previous IDs redirect when a reviewed group changes its canonical target. All original records, metadata, references, source assertions and directions remain inspectable.

React URL routing is not network routing; IPv6-router specialization is not a generic router; Python HTTP support is not the HTTP protocol; CSS-like native styles are not browser CSS; CUDA is not GPU hardware. The existing storage-image-volume and VM/runtime distinctions remain.

Source evidence is retained, not independently endorsed. Some uploads contain historical, version-sensitive, uncited or expansion-only assertions. Editorial documentation does not validate those original assertions.

Schema adapters cover relation/relationship/type predicates; sequence/ordered_nodes/steps/prose paths; paths and claims referenced by node ID; string/object titles. Manifest records exact JSON pointers, normalized IDs and SHA-256 hashes. Invalid references fail the build with their source endpoint.

## Added editorial connections

Each connection has direction, predicate, scope, rationale, documentation section and evidence-check date; no statistical/fuzzy inference is used.
- editorial:tcp-ip-transport: TCP_IP:tcp — uses_network_service → Internet_Protocol.json:ip. TCP carries its segments through IP; reliable byte-stream transport and best-effort network datagrams are distinct layers. Scope: TCP over IPv4 or IPv6; not identity of TCP with IP. Evidence: https://www.rfc-editor.org/rfc/rfc9293.html (2.2 Key TCP Concepts and 3.1 Header Format).
- editorial:http-tcp-version-scope: ruby_on_rails:http — uses_transport_in_versions → TCP_IP:tcp. HTTP/1.x commonly uses TCP and HTTP/2 uses TCP transport. HTTP/3 maps HTTP to QUIC instead, so TCP is not a universal HTTP dependency. Scope: HTTP/1.x and HTTP/2 only; HTTP/3 excluded. Evidence: https://www.rfc-editor.org/rfc/rfc9113.html, https://www.rfc-editor.org/rfc/rfc9114.html (RFC 9113 section 2; RFC 9114 introduction).
- editorial:next-web-framework: Next.js.json:nextjs — is_a → Web_Framework.json:web_framework. Next.js supplies full-stack web application framework capabilities around React components. This classifies Next.js, not React itself or React Native. Scope: Web application framework category. Evidence: https://nextjs.org/docs (What is Next.js?).
- editorial:next-css: Next.js.json:nextjs — supports_styling_with → ruby_on_rails:css. Next.js supports CSS Modules and global CSS, connecting application framework features to the separate Web styling language. Scope: CSS support is not framework implementation language. Evidence: https://nextjs.org/docs/app/getting-started/css (CSS Modules and Global CSS).
- editorial:native-css-distinction: React_Native.json:react_native — distinguishes_native_styles_from → ruby_on_rails:css. React Native uses JavaScript style objects with CSS-like names and native platform views. Similar styling vocabulary is not browser CSS rendering. Scope: Core Android/iOS native components; not an assertion about React Native Web. Evidence: https://reactnative.dev/docs/style, https://reactnative.dev/docs/intro-react-native-components (Style and Native Components).
- editorial:cloud-vm-option: cloud_computing — can_provision → virtual_machine. Cloud infrastructure can supply virtual machines: Amazon EC2 documents virtual servers as cloud compute instances. This is one concrete service model, not a definition of all cloud services. Scope: Optional IaaS deployment; cloud can also use bare metal and managed services. Evidence: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html (What is Amazon EC2?).
- editorial:cloud-firewall-option: Cloud_Computing.json:security — can_use → firewall:firewall. Cloud VM security can include virtual firewalls; EC2 security groups provide protocol, port and address controls. Firewalling is one control, not the entire cloud-security model. Scope: EC2 security groups as a concrete example, not mandatory architecture for every cloud. Evidence: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html (Features: Security groups).
- editorial:wifi-physical: wifi_graph.json:ieee80211 — specifies_layer → osi_model:layer_1. IEEE 802.11 specifies wireless LAN physical-layer behavior as well as MAC behavior; radio signaling belongs to the physical layer. Scope: Standard-to-layer direction, not a claim that Wi-Fi is only Layer 1. Evidence: https://www.ieee802.org/11/abt80211.html (IEEE 802.11 scope: MAC and PHY specifications).
- editorial:wifi-link: wifi_graph.json:ieee80211 — specifies_mac_sublayer → osi_model:layer_2. IEEE 802.11 specifies medium access control, part of the data-link layer, alongside separate physical-layer specifications. Scope: MAC sublayer, not the whole OSI layer and not IP routing. Evidence: https://www.ieee802.org/11/abt80211.html (IEEE 802.11 scope: MAC and PHY specifications).
- editorial:lua-c-embedding: Lua.json:lua_c_api — provides_embedding_api_for → c. The Lua manual defines a C API by which a host program exchanges values with Lua and invokes Lua functions. An embedding interface is not a claim that every Lua application is written in C. Scope: Lua 5.4 C API. Evidence: https://www.lua.org/manual/5.4/manual.html (4 The Application Program Interface).

## Verification limitations

Browser tool was running, but opening http://localhost:4175/#explorer was denied: browser navigation blocked by policy. No CLI/CDP bypass or global configuration change was attempted. Therefore real rendering, interaction usability and console-error absence are NOT verified. JSDOM/mock-Canvas and HTTP checks are separate evidence, not visual proof. GitHub Actions API reported zero configured workflows; no CI is not a pass. Historical QA images and design diagrams are retained as historical artifacts, not current proof.

## Example traversals (not dependency chains)

- Network packet ← specializes_as — IP packet ← defines — IP; source edges Network_Packet_Semantic_Knowledge_Graph.json:75 and :71. Follow incoming TCP uses_network_service to IP, then version-scoped HTTP uses_transport_in_versions to TCP. HTTP constrains_architecture_of Web framework is original Web_Framework.json:79. Traversal can follow either direction; displayed arrows never reverse the assertion.
- Next.js extends React (Next.js.json:0) and is_framework_for React (React_Graph.json:165) remain parallel source records.
- Network switch can_connect_to Router (Network_Switch.json:46) joins the reviewed campus/router records.
- PyTorch contains_runtime PyTorch runtime (pytorch:144); Python API calls_into runtime (pytorch:145); Python provides_language_for API (pytorch:13). CUDA provides_acceleration_for internal CUDA bindings (pytorch:15), which are integrated_into PyTorch (pytorch:16). These source directions remain intact.

The source-claim-reference evidence list is empty for all 8,604 relationships; original source-line ranges, provenance objects and bibliography metadata are nevertheless preserved in raw fields. This is not a claim that all source relationships lack provenance, nor that any were independently verified.
