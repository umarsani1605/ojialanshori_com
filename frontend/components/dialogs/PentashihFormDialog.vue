<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';
import { useSantriStore } from '@/stores/santriStore';
import { useToast } from 'primevue/usetoast';

const dialogRef = inject('dialogRef');
const emit = defineEmits(['cancel', 'save', 'delete']);
const confirm = useConfirm();
const toast = useToast();

const pentashih = dialogRef.value.data;
const formData = ref({
  santri_ids: pentashih.santri_list?.map((santri) => santri.id) || [],
});
const submitted = ref(false);
const pentashihList = ref([]);
const selectedPentashih = ref(null);
const availableSantriList = ref([]);

const router = useRouter();
const santriStore = useSantriStore();

const fetchSantriList = async () => {
  try {
    const response = await santriStore.getAll();
    pentashihList.value = response.data.map((santri) => ({
      id: santri.id,
      name: santri.fullname,
      gender: santri.gender,
    }));

    if (pentashih.id_pentashih) {
      selectedPentashih.value = pentashihList.value.find((p) => p.id === pentashih.id_pentashih);
    }

    console.log('Pentashih List:', pentashihList.value); // Debug log
  } catch (error) {
    console.error('Error fetching santri list:', error);
  }
};

watch(selectedPentashih, async (newPentashih) => {
  if (newPentashih) {
    const existingSantriIds = formData.value.santri_ids;
    const response = await santriStore.getAll({ gender: newPentashih.gender });

    availableSantriList.value = [...response.data, ...(pentashih.santri_list || [])]
      .filter((santri) => santri.id !== selectedPentashih.value?.id)
      .map((santri) => ({
        id: santri.id,
        name: santri.fullname,
        gender: santri.gender,
      }));

    formData.value.santri_ids = existingSantriIds;
  } else {
    availableSantriList.value = [];
  }
});

const showDeleteConfirmation = () => {
  confirm.require({
    message: 'Daftar santri kosong. Apakah Anda ingin menghapus pentashih ini?',
    header: 'Konfirmasi Penghapusan',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Tidak',
    accept: () => {
      emit('delete', selectedPentashih.value.id);
      dialogRef.value.close();
    },
    reject: () => {
      // Biarkan user melanjutkan edit tanpa santri
    },
  });
};

const onSave = async () => {
  submitted.value = true;

  if (!selectedPentashih.value) {
    return;
  }

  try {
    console.log('Selected Pentashih:', selectedPentashih.value); // Debug log

    // Update role santri menjadi pentashih
    await santriStore.updateRole(selectedPentashih.value.id, 'pentashih');

    // Tambahkan sebagai pentashih
    await emit('save', {
      id_pentashih: selectedPentashih.value.id,
      santri_ids: formData.value.santri_ids,
    });

    dialogRef.value.close();
  } catch (error) {
    console.error('Error saving pentashih:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal menyimpan data pentashih',
      life: 3000,
    });
  }
};

const onCancel = () => {
  emit('cancel');
  dialogRef.value.close();
};

const goToPentashihList = () => {
  dialogRef.value.close();
  router.push('/admin/daftar-pentashih');
};

onMounted(() => {
  fetchSantriList();
  console.log(pentashih);
});
</script>

<template>
  <div class="p-fluid w-[500px]">
    <ConfirmDialog />

    <div class="field flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <label for="pentashih">Pentashih <span class="text-red-500">*</span></label>
      </div>
      <Dropdown
        id="pentashih"
        v-model="selectedPentashih"
        :options="pentashihList"
        optionLabel="name"
        placeholder="Pilih Santri"
        :class="{ 'p-invalid': submitted && !selectedPentashih }"
        :disabled="!!pentashih.id_pentashih"
      />
    </div>

    <div class="field flex flex-col gap-2">
      <label for="santri">Daftar Santri</label>
      <MultiSelect
        id="santri"
        v-model="formData.santri_ids"
        :options="availableSantriList"
        optionLabel="name"
        optionValue="id"
        placeholder="Pilih Santri"
        display="chip"
        :disabled="!selectedPentashih"
        filter
        :pt="{
          label: 'flex-wrap',
        }"
      />
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <Button label="Cancel" icon="pi pi-times" outlined @click="onCancel" />
      <Button label="Save" icon="pi pi-check" @click="onSave" />
    </div>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style>
