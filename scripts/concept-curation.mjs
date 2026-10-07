// Reviewed semantic identities, never fuzzy/string-similarity merges.
// Members are source-qualified so a future same-spelling concept cannot opt in.
const group = (id, label, members, rationale, evidenceUrls = []) => ({ id, label, members, rationale, evidenceUrls });
export const aliasGroups = [
  group('sandbox', 'Sandbox', ['operating_system:sandbox', 'sandbox_computer_security:sandbox'], 'OS relationships[313] provides foundational isolation mechanisms; sandbox definition identifies the security mechanism. VM software-sandbox use case remains scoped.'),
  group('jvm', 'Java Virtual Machine', ['python_language:jvm', 'virtual_machine:jvm'], 'Python relationships[310] runs Jython on Java VM; VM relationships[33] explicitly classifies Java Virtual Machine as a process VM. Python VM is excluded.'),
  group('kubernetes', 'Kubernetes', ['containerization:kubernetes', 'docker:kubernetes', 'kubernetes:k8s', 'operating_system:kubernetes'], 'All three source definitions identify the Kubernetes platform; K8s is its abbreviation.', ['https://kubernetes.io/docs/concepts/overview/']),
  group('virtual_machine', 'Virtual Machine', ['containerization:virtual_machine', 'docker:vm', 'virtual_machine:virtual_machine', 'operating_system:virtual_machine', 'sandbox_computer_security:vm'], 'The Docker abbreviation and both full-name records refer to the VM concept, not to a particular VM instance.'),
  group('namespaces', 'Linux Namespaces', ['containerization:namespaces', 'docker:namespaces', 'sandbox_computer_security:namespaces'], 'Both records describe the Linux kernel isolation mechanism; Kubernetes resource namespaces are excluded.', ['https://docs.docker.com/engine/security/']),
  group('cgroups', 'Linux cgroups', ['containerization:cgroups', 'docker:cgroups', 'sandbox_computer_security:cgroups'], 'Both records describe the Linux kernel control-group mechanism.', ['https://docs.docker.com/engine/security/']),
  group('dependency', 'Application Dependency', ['containerization:dependency', 'docker:dependencies'], 'Singular/plural records describe software dependencies bundled with an application; the library subtype remains separate.'),
  group('openshift', 'OpenShift', ['containerization:open_shift', 'docker:openshift'], 'Spelling variants identify the same named OpenShift platform in both source definitions.'),
  group('freebsd_jail', 'FreeBSD jail', ['containerization:freebsd_jail', 'virtual_machine:freebsd_jails'], 'Singular/plural records identify the same named FreeBSD jail technology.'),
  group('portability', 'Application Portability', ['containerization:portability', 'docker:portability', 'kubernetes:container_portability'], 'Definitions all describe moving packaged applications between execution environments; infrastructure/API portability remains distinct.')
];

// Identical IDs and labels are NOT sufficient when the local definitions differ.
export const forcedScopes = {
  'operating_system:vm': { id: 'operating_system:vm', label: 'Virtual machine (OS taxonomy)', rationale: 'OS relationships[317] connects virtual_machine to vm as same_concept_family; they are not merged.' },
  'python_language:vm': { id: 'python_language:vm', label: 'Python virtual machine', rationale: 'Python relationships[193-194] identifies CPython bytecode runtime, not a generic system VM.' },
  'sandbox_computer_security:linux': { id: 'sandbox_computer_security:linux', label: 'Linux application sandboxing', rationale: 'Sandbox relationships[25-27] identifies an implementation built on seccomp/cgroups/namespaces, not the Linux OS.' },
  'python_language:namespace': { id: 'python_language:namespace', label: 'Python Namespace', rationale: 'Python runtime name binding is not Kubernetes resource grouping.' },
  'sandbox_computer_security:isolation': { id: 'sandbox_computer_security:isolation', label: 'Sandbox Isolation', rationale: 'Sandbox security property is broader than VM-environment separation.' },
  'virtual_machine:isolation': { id: 'virtual_machine:isolation', label: 'VM Isolation', rationale: 'VM environment separation remains distinct from generic sandbox security property.' },
  'sandbox_computer_security:ios': { id: 'sandbox_computer_security:ios', label: 'iOS/iPadOS sandboxing', rationale: 'Source implementation record is the application sandbox, not the OS product.' },
  'operating_system:ios': { id: 'operating_system:ios', label: 'iOS/iPadOS', rationale: 'OS product, not sandbox implementation.' },
  'docker:host': { id: 'docker:host', label: 'Docker Host', rationale: 'Docker host can be a physical machine or VM; the VM document explicitly defines host as a physical machine.' },
  'virtual_machine:host': { id: 'virtual_machine:host', label: 'VM Host', rationale: 'Physical host role retained separately from the broader Docker host role.' },
  'kubernetes:namespace': { id: 'kubernetes:namespace', label: 'Kubernetes Namespace', rationale: 'Kubernetes resource grouping is not Linux kernel isolation.' }
};

export const declinedMerges = [
  { ids: ['operating_system:vm', 'virtual_machine', 'python_language:vm'], rationale: 'OS same_concept_family edge[317] must survive; Python bytecode runtime relationships[193-194] are not system-VM identities.' },
  { ids: ['sandbox_computer_security:linux', 'docker:linux', 'linux_kernel'], rationale: 'Linux application sandboxing implementation, Linux OS and Linux kernel have distinct scopes.' },
  { ids: ['sandbox', 'virtual_machine:sandbox'], rationale: 'Security mechanism and software-sandbox use-case record remain distinct.' },
  { ids: ['volume_computing:volume', 'docker:volume', 'kubernetes:volume'], rationale: 'Generic logical storage, Docker persistence and Kubernetes mounted storage are not synonyms.' },
  { ids: ['optical_disc_image:filesystem', 'operating_system:filesystem', 'volume_computing:filesystem'], rationale: 'Optical filesystem remains distinct from generic filesystem; no speculative identity is introduced.' },
  { ids: ['system_image', 'disk_image', 'optical_disc_image', 'image', 'container_image'], rationale: 'System-image relationship[3] is conditional on all relevant state being on disk, not an identity; optical relationship[0] is classification.' },
  { ids: ['image', 'container_image'], rationale: 'Docker image is a product-specific artifact; the other record is OCI-oriented and generic. Keep the narrower/broader distinction and add a typed editorial edge.' },
  { ids: ['docker_swarm', 'swarm', 'swarm_cluster'], rationale: 'The source distinguishes orchestration technology from a cooperating-daemon cluster and a cluster grouping. Do not erase that distinction based on the shared Docker Swarm label.' },
  { ids: ['workload_partitions', 'aix_workload_partitions'], rationale: 'The generic source record does not explicitly identify AIX; insufficient evidence for an identity merge.' },
  { ids: ['containerization:virtuozzo', 'virtual_machine:virtuozzo'], rationale: 'Generic Virtuozzo versus specifically branded Parallels Virtuozzo Containers may carry product/version scope; retain both.' },
  { ids: ['docker:service', 'kubernetes:service'], rationale: 'Docker service is an orchestration abstraction; Kubernetes Service is a network abstraction.' },
  { ids: ['docker:volume', 'kubernetes:volume'], rationale: 'Product-specific storage objects have different scopes and lifecycles.' },
  { ids: ['namespaces', 'kubernetes:namespace'], rationale: 'Linux kernel process isolation and Kubernetes API resource grouping are different concepts.' },
  { ids: ['docker:host', 'virtual_machine:host'], rationale: 'Identical labels hide different physical/virtual host scopes; split the previous automatic merge.' },
  { ids: ['container_cluster', 'kubernetes:cluster', 'virtual_machine:cluster'], rationale: 'Container, Kubernetes, and general computer-cluster scopes are not identical.' },
  { ids: ['os_kernel', 'linux_kernel', 'shared_kernel', 'kernel_sharing'], rationale: 'General kernel, Linux implementation, shared-kernel model, and sharing mechanism are not identities.' },
  { ids: ['portability', 'kubernetes:portability', 'platform_independence'], rationale: 'Application portability, infrastructure/API portability, and process-VM platform independence are different scopes.' },
  { ids: ['containerization:load_balancing', 'kubernetes:load_balancing', 'containerization:scaling', 'kubernetes:scaling', 'containerization:logging', 'kubernetes:logging', 'containerization:monitoring', 'kubernetes:monitoring'], rationale: 'Keep generic activities separate from Kubernetes-specific mechanisms or example workloads.' },
  { ids: ['container', 'image', 'pod', 'virtual_machine', 'system_vm', 'process_vm', 'container_runtime', 'docker_engine', 'containerd'], rationale: 'Runtime unit, image artifact, Pod grouping, VM abstraction/subtypes, runtime category and implementations are not synonyms.' }
];

const containerDocs = 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/';
const securityDocs = 'https://docs.docker.com/engine/security/';
export const editorialRelations = [
  { id: 'editorial:docker-runs-container', source: 'docker', target: 'container', relation: 'runs_and_manages', rationale: 'Make the platform-to-runtime-unit relationship direct rather than requiring a detour through Engine/API nodes. Docker documentation demonstrates running, listing and stopping containers.', evidenceUrls: [containerDocs] },
  { id: 'editorial:docker-image-container-image', source: 'image', target: 'container_image', relation: 'is_a', rationale: 'Connect the Docker-specific image artifact to the general container image category without conflating their scopes.', evidenceUrls: ['https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/'] },
  { id: 'editorial:container-linux-namespaces', source: 'container', target: 'namespaces', relation: 'uses_for_isolation', scope: 'Linux containers; not Kubernetes resource namespaces and not a complete security boundary', rationale: 'Expose the kernel isolation mechanism directly in the container neighborhood. Docker documents namespace creation for Linux containers.', evidenceUrls: [securityDocs] },
  { id: 'editorial:container-linux-cgroups', source: 'container', target: 'cgroups', relation: 'uses_for_resource_limits', scope: 'Linux containers', rationale: 'Expose resource accounting and limiting directly, distinct from namespace isolation.', evidenceUrls: [securityDocs] },
  { id: 'editorial:virtual-machine-hosts-container', source: 'virtual_machine', target: 'container', relation: 'can_host', scope: 'A VM with a container runtime; coexistence, not identity or a universal requirement', rationale: 'Make VM/container coexistence navigable; the Docker guide explicitly describes a VM running multiple containers through a container runtime.', evidenceUrls: [containerDocs] }
];
